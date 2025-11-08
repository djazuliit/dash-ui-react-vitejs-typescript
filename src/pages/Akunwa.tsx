import { useEffect, useState } from "react";
import { Button, Card, Container, Modal } from "react-bootstrap";
import DataTable from "react-data-table-component";
import api from "../api/axios";
import ioClient from "socket.io-client";

const WaAccounts = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const userId = localStorage.getItem("user_id");
  const userLevel = localStorage.getItem("user_level");

  // 🔹 Ambil data akun WA
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wa/accounts", {
        headers: { "x-user-id": userId, "x-user-level": userLevel },
      });
      setData(res.data);
      setFilteredData(res.data);
    } catch (err) {
      console.error("❌ Gagal ambil data akun WA:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, userLevel]);

  // 🔹 Pencarian
  const handleSearch = (keyword: string) => {
    const lower = keyword.toLowerCase();
    setFilteredData(
      data.filter(
        (item) =>
          item.name?.toLowerCase().includes(lower) ||
          item.wa_id?.toLowerCase().includes(lower) ||
          item.status?.toLowerCase().includes(lower)
      )
    );
  };

  // 🔹 Tambah akun WA (scan QR)
  const handleAddWA = () => {
    setShowModal(true);
    setQr(null);
    setStatus("");

    const socket = ioClient("http://localhost:5000");
    const waId = `wa_${Date.now()}`;

    socket.emit("connect-wa", { userId, waId });

    socket.on("qr", (data: { qr: string }) => {
      setQr(data.qr);
      setStatus("📱 Scan QR dengan WhatsApp Anda");
    });

    socket.on("connected", async () => {
      setStatus("✅ WA Connected");
      setQr(null);

      // Tutup modal setelah 1 detik
      setTimeout(() => setShowModal(false), 1000);
      await fetchData();
    });

    socket.on("disconnected", () => setStatus("⚠️ WA Disconnected"));

    return () => socket.disconnect();
  };

  // 🔹 Start Blast
  const handleStartBlast = async (waId: string) => {
    if (!window.confirm(`Mulai blast dengan akun WA: ${waId}?`)) return;

    try {
      await api.post("/blast/start", {
        userId,
        waId,
        message: "Pesan otomatis dari sistem WA Blast",
      });

      alert(`✅ Blast dimulai untuk akun: ${waId}`);
    } catch (err: any) {
      alert("❌ Gagal memulai blast: " + (err.response?.data?.message || err.message));
    }
  };

  // 🔹 Kolom DataTable
  const columns = [
    { name: "ID", selector: (row: any) => row.id, sortable: true, width: "80px" },
    {
      name: "User ID",
      selector: (row: any) => row.user_id,
      sortable: true,
      omit: userLevel !== "1",
    },
    { name: "WA ID", selector: (row: any) => row.wa_id, sortable: true },
    { name: "Nama Akun", selector: (row: any) => row.name, sortable: true },
    {
      name: "Status",
      selector: (row: any) => row.status,
      cell: (row: any) => (
        <span
          className={`badge bg-${
            row.status === "active"
              ? "success"
              : row.status === "inactive"
              ? "secondary"
              : "warning"
          }`}
        >
          {row.status.toUpperCase()}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Session Path",
      selector: (row: any) => row.session_path || "-",
      grow: 2,
    },
    {
      name: "Dibuat",
      selector: (row: any) =>
        new Date(row.created_at).toLocaleString("id-ID"),
      sortable: true,
    },
    {
      name: "Aksi",
      cell: (row: any) => (
        <Button
          size="sm"
          variant="success"
          onClick={() => handleStartBlast(row.wa_id)}
          title={`Mulai blast untuk ${row.wa_id}`}
        >
          🚀 Start Blast
        </Button>
      ),
      ignoreRowClick: true,
    },
  ];

  return (
    <Container fluid className="p-4 mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">📱 Akun WhatsApp</h4>
        <Button variant="primary" onClick={handleAddWA}>
          ➕ Tambah Akun WA
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <DataTable
            columns={columns}
            data={filteredData}
            progressPending={loading}
            pagination
            highlightOnHover
            striped
            dense
            noDataComponent="Tidak ada akun WA"
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            subHeader
            subHeaderComponent={
              <input
                type="text"
                placeholder="🔍 Cari akun..."
                className="form-control w-25"
                onChange={(e) => handleSearch(e.target.value)}
              />
            }
          />
        </Card.Body>
      </Card>

      {/* 🔹 Modal Scan QR */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Akun WA</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {qr && (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                qr
              )}`}
              alt="QR Code"
            />
          )}
          <p className="mt-3">{status || "Menunggu QR..."}</p>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default WaAccounts;
