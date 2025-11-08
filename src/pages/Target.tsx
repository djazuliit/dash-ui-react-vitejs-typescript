import { useEffect, useState } from "react";
import { Button, Card, Container, Modal, Form, Alert } from "react-bootstrap";
import DataTable from "react-data-table-component";
import api from "../api/axios";
import { FaTrash, FaEdit } from "react-icons/fa";

const Target = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [alert, setAlert] = useState<{ show: boolean; message: string; type: 'success' | 'danger' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    group_name: "",
  });

  const userId = localStorage.getItem("user_id");
  const userLevel = localStorage.getItem("user_level");

  // 🔹 Ambil data target - FIXED
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching data from /targets...");
      
      const res = await api.get("/targets", { // ✅ HAPUS SLASH di akhir
        headers: { 
          "x-user-id": userId, 
          "x-user-level": userLevel 
        },
      });
      
      console.log("✅ Data received:", res.data);
      setData(res.data);
      setFilteredData(res.data);
    } catch (err: any) {
      console.error("❌ Gagal ambil data target:", err);
      console.error("❌ Error details:", {
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      showAlert("Gagal memuat data target. Pastikan server berjalan di port 5000", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, userLevel]);

  // 🔹 Tampilkan alert
  const showAlert = (message: string, type: 'success' | 'danger') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 5000);
  };

  // 🔹 Pencarian data target
  const handleSearch = (keyword: string) => {
    const lower = keyword.toLowerCase();
    setFilteredData(
      data.filter(
        (item) =>
          item.name?.toLowerCase().includes(lower) ||
          item.phone?.toLowerCase().includes(lower) ||
          item.group_name?.toLowerCase().includes(lower)
      )
    );
  };

  // 🔹 Buka modal tambah
  const handleAddTarget = () => {
    setFormData({ name: "", phone: "", group_name: "" });
    setShowModal(true);
  };

  // 🔹 Simpan target baru - FIXED
  const handleSaveTarget = async () => {
    if (!formData.name || !formData.phone) {
      showAlert("Nama dan Nomor HP wajib diisi!", "danger");
      return;
    }

    try {
      console.log("🔄 Creating new target...", formData);
      
      await api.post(
        "/targets", // ✅ tanpa slash
        { ...formData },
        {
          headers: { 
            "x-user-id": userId, 
            "x-user-level": userLevel 
          },
        }
      );

      showAlert("✅ Target berhasil ditambahkan!", "success");
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      console.error("❌ Gagal menambahkan target:", err);
      showAlert("❌ Gagal menambahkan target: " + (err.response?.data?.message || err.message), "danger");
    }
  };

  // 🔹 Buka modal konfirmasi delete
  const handleDeleteClick = (target: any) => {
    setSelectedTarget(target);
    setShowDeleteModal(true);
  };

  // 🔹 Hapus target - FIXED
  const handleDeleteConfirm = async () => {
    if (!selectedTarget) return;

    try {
      console.log(`🔄 Deleting target ${selectedTarget.id}...`);
      
      await api.delete(`/targets/${selectedTarget.id}`, { // ✅ tanpa slash di awal path
        headers: { 
          "x-user-id": userId, 
          "x-user-level": userLevel 
        },
      });

      showAlert("✅ Target berhasil dihapus!", "success");
      setShowDeleteModal(false);
      setSelectedTarget(null);
      fetchData();
    } catch (err: any) {
      console.error("❌ Gagal menghapus target:", err);
      showAlert("❌ Gagal menghapus target: " + (err.response?.data?.message || err.message), "danger");
    }
  };

  // 🔹 Kolom tabel
  const columns = [
    { 
      name: "ID", 
      selector: (row: any) => row.id, 
      sortable: true, 
      width: "80px" 
    },
    {
      name: "Nama",
      selector: (row: any) => row.name,
      sortable: true,
    },
    {
      name: "Nomor HP",
      selector: (row: any) => row.phone,
      sortable: true,
    },
    {
      name: "Grup",
      selector: (row: any) => row.group_name || "-",
      sortable: true,
    },
    {
      name: "Dibuat",
      selector: (row: any) =>
        new Date(row.created_at).toLocaleString("id-ID"),
      sortable: true,
      width: "180px",
    },
    {
      name: "Aksi",
      cell: (row: any) => (
        <div className="d-flex gap-2">
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleDeleteClick(row)}
            title="Hapus Target"
          >
            <FaTrash />
          </Button>
        </div>
      ),
      width: "100px",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // 🔹 Test koneksi manual
  const testConnection = async () => {
    try {
      const res = await api.get("/targets");
      console.log("✅ Connection test successful:", res.status);
      showAlert("Koneksi ke server berhasil!", "success");
    } catch (err) {
      console.error("❌ Connection test failed:", err);
      showAlert("Koneksi ke server gagal! Pastikan NestJS berjalan di port 5000", "danger");
    }
  };

  return (
    <Container fluid className="p-4 mt-3">
      {alert.show && (
        <Alert variant={alert.type} className="mb-3">
          {alert.message}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold">🎯 Daftar Target</h4>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={testConnection}>
            🔄 Test Koneksi
          </Button>
          <Button variant="primary" onClick={handleAddTarget}>
            ➕ Tambah Target
          </Button>
        </div>
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
            noDataComponent={
              <div className="text-center py-4">
                {loading ? "Memuat data..." : "Belum ada data target"}
              </div>
            }
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            subHeader
            subHeaderComponent={
              <input
                type="text"
                placeholder="🔍 Cari target..."
                className="form-control w-25"
                onChange={(e) => handleSearch(e.target.value)}
              />
            }
          />
        </Card.Body>
      </Card>

      {/* 🔹 Modal Tambah Target */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Target Baru</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nama *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Masukkan nama target"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nomor HP *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Masukkan nomor HP (contoh: 6281234567890)"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Grup (Opsional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nama grup target"
                value={formData.group_name}
                onChange={(e) =>
                  setFormData({ ...formData, group_name: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSaveTarget}>
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 🔹 Modal Konfirmasi Hapus */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Hapus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Apakah Anda yakin ingin menghapus target ini?</p>
          <div className="bg-light p-3 rounded">
            <strong>Nama:</strong> {selectedTarget?.name}<br />
            <strong>Nomor HP:</strong> {selectedTarget?.phone}<br />
            <strong>Grup:</strong> {selectedTarget?.group_name || '-'}
          </div>
          <Alert variant="warning" className="mt-3">
            <small>Data yang dihapus tidak dapat dikembalikan!</small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            <FaTrash className="me-1" />
            Hapus
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Target;