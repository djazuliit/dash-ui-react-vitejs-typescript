import { useEffect, useState } from "react";
import { Button, Card, Container, Form, Alert, Spinner, Modal, Badge } from "react-bootstrap";
import DataTable from "react-data-table-component";
import api from "../api/axios";
import { FaEdit, FaCheck, FaTimes, FaEye, FaSync, FaUser, FaMoneyBill, FaCreditCard } from "react-icons/fa";

const WdManagement = () => {
  const [wdData, setWdData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedWd, setSelectedWd] = useState<any>(null);

  const [alert, setAlert] = useState<{ show: boolean; message: string; type: "success" | "danger" }>({
    show: false,
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    status: "",
    admin_notes: "",
    processing_time: 0
  });

  const userId = localStorage.getItem("user_id");
  const userLevel = localStorage.getItem("user_level");

  // 🔹 Cek akses admin
  const isAdmin = userLevel === "1";

  // 🔹 Alert handler
  const showAlert = (message: string, type: "success" | "danger") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 5000);
  };

  // 🔹 Ambil semua data WD
  const fetchWdData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wd", {
        headers: { "x-user-id": userId, "x-user-level": userLevel },
      });
      console.log("📊 WD Data:", res.data);
      // Pastikan mengambil data dari response yang benar
      setWdData(res.data.data || res.data);
    } catch (err: any) {
      console.error("❌ Gagal ambil data WD:", err);
      showAlert("Gagal memuat data withdraw.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchWdData();
    }
  }, [isAdmin]);

  // 🔹 Buka modal edit
  const handleEdit = (wd: any) => {
    setSelectedWd(wd);
    setFormData({
      status: wd.status,
      admin_notes: wd.admin_notes || "",
      processing_time: wd.processing_time || 0
    });
    setShowModal(true);
  };

  // 🔹 Buka modal detail
  const handleView = (wd: any) => {
    setSelectedWd(wd);
    setFormData({
      status: wd.status,
      admin_notes: wd.admin_notes || "",
      processing_time: wd.processing_time || 0
    });
    setShowModal(true);
  };

  // 🔹 Update status WD
  const handleUpdate = async () => {
    if (!selectedWd || !formData.status) {
      showAlert("Status harus diisi!", "danger");
      return;
    }

    try {
      setUpdating(true);

      const response = await api.put(
        `/wd/${selectedWd.id}/status`,
        {
          status: formData.status,
          admin_notes: formData.admin_notes,
          processing_time: formData.processing_time
        },
        {
          headers: { "x-user-id": userId, "x-user-level": userLevel },
        }
      );

      showAlert("✅ Status withdraw berhasil diperbarui!", "success");
      setShowModal(false);
      fetchWdData();
    } catch (err: any) {
      console.error("❌ Gagal update WD:", err);
      showAlert(err.response?.data?.message || "Gagal memperbarui status.", "danger");
    } finally {
      setUpdating(false);
    }
  };

  // 🔹 Format status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { variant: "warning", label: "Menunggu", icon: FaSync },
      processing: { variant: "info", label: "Diproses", icon: FaEdit },
      completed: { variant: "success", label: "Selesai", icon: FaCheck },
      rejected: { variant: "danger", label: "Ditolak", icon: FaTimes }
    };

    const config = statusConfig[status] || { variant: "secondary", label: status, icon: FaEye };
    const IconComponent = config.icon;

    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1 py-2 px-3">
        <IconComponent size={12} />
        {config.label}
      </Badge>
    );
  };

  // 🔹 Kolom tabel yang profesional
  const columns = [
    {
      name: "ID",
      selector: (row: any) => row.id,
      width: "80px",
      sortable: true,
      center: true
    },
    {
      name: "USER",
      cell: (row: any) => (
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
               style={{ width: '32px', height: '32px' }}>
            <FaUser className="text-white" size={14} />
          </div>
          <div>
            <div className="fw-semibold">{row.user?.name || "N/A"}</div>
            <small className="text-muted">@{row.user?.username}</small>
          </div>
        </div>
      ),
      sortable: true,
      minWidth: "200px"
    },
    {
      name: "NOMINAL",
      selector: (row: any) => parseFloat(row.nominal),
      cell: (row: any) => (
        <div className="text-success fw-bold">
          <FaMoneyBill className="me-2" />
          Rp {parseFloat(row.nominal).toLocaleString("id-ID")}
        </div>
      ),
      sortable: true,
      width: "180px"
    },
    {
      name: "BANK",
      cell: (row: any) => (
        <div>
          <div className="fw-semibold">
            <FaCreditCard className="me-2 text-primary" />
            {row.bank_name}
          </div>
          <small className="text-muted">{row.bank_account_number}</small>
          <div className="text-muted small">{row.bank_account_holder}</div>
        </div>
      ),
      minWidth: "220px"
    },
    {
      name: "STATUS",
      selector: (row: any) => row.status,
      cell: (row: any) => getStatusBadge(row.status),
      sortable: true,
      width: "140px",
      center: true
    },
    {
      name: "WAKTU PROSES",
      selector: (row: any) => row.processing_time,
      cell: (row: any) => (
        <div className="text-center">
          {row.processing_time ? (
            <span className="fw-semibold">{row.processing_time} Hari</span>
          ) : (
            <span className="text-muted">-</span>
          )}
        </div>
      ),
      sortable: true,
      width: "130px"
    },
    {
      name: "TANGGAL",
      selector: (row: any) => new Date(row.created_at),
      cell: (row: any) => (
        <div>
          <div className="small fw-semibold">
            {new Date(row.created_at).toLocaleDateString("id-ID")}
          </div>
          <div className="text-muted small">
            {new Date(row.created_at).toLocaleTimeString("id-ID")}
          </div>
        </div>
      ),
      sortable: true,
      width: "150px"
    },
    {
      name: "AKSI",
      cell: (row: any) => (
        <div className="d-flex gap-1">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleView(row)}
            title="Lihat Detail"
          >
            <FaEye />
          </Button>
          <Button
            variant="outline-warning"
            size="sm"
            onClick={() => handleEdit(row)}
            title="Edit Status"
          >
            <FaEdit />
          </Button>
        </div>
      ),
      width: "120px",
      center: true
    },
  ];

  // 🔹 Custom styles untuk tabel
  const customStyles = {
    headCells: {
      style: {
        backgroundColor: '#f8f9fa',
        fontWeight: 'bold',
        fontSize: '14px',
      },
    },
    rows: {
      style: {
        fontSize: '14px',
        minHeight: '60px',
      },
    },
  };

  if (!isAdmin) {
    return (
      <Container fluid className="p-4 mt-3">
        <Alert variant="danger" className="text-center">
          <h4 className="fw-bold">🚫 Akses Ditolak</h4>
          <p className="mb-0">Hanya admin yang dapat mengakses halaman ini.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 mt-3">
      {alert.show && <Alert variant={alert.type}>{alert.message}</Alert>}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">💼 Withdraw Management</h2>
          <p className="text-muted mb-0">Kelola semua pengajuan withdraw dari user</p>
        </div>
        <Button variant="outline-primary" onClick={fetchWdData} disabled={loading}>
          <FaSync className={loading ? "spin" : ""} /> 
          {loading ? " Memuat..." : " Refresh"}
        </Button>
      </div>

      {/* Statistik Cepat */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total WD</h6>
                  <h4 className="fw-bold mb-0">{wdData.length}</h4>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FaMoneyBill className="text-primary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Menunggu</h6>
                  <h4 className="fw-bold mb-0 text-warning">
                    {wdData.filter(wd => wd.status === 'pending').length}
                  </h4>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <FaSync className="text-warning" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Diproses</h6>
                  <h4 className="fw-bold mb-0 text-info">
                    {wdData.filter(wd => wd.status === 'processing').length}
                  </h4>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <FaEdit className="text-info" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Selesai</h6>
                  <h4 className="fw-bold mb-0 text-success">
                    {wdData.filter(wd => wd.status === 'completed').length}
                  </h4>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FaCheck className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Tabel Data */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0 fw-semibold">📋 Daftar Withdraw</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            data={wdData}
            progressPending={loading}
            progressComponent={
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <div className="mt-2 text-muted">Memuat data withdraw...</div>
              </div>
            }
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            highlightOnHover
            striped
            responsive
            customStyles={customStyles}
            noDataComponent={
              <div className="text-center py-5 text-muted">
                <FaMoneyBill size={48} className="mb-3 opacity-25" />
                <h5>Belum ada data withdraw</h5>
                <p className="mb-0">Tidak ada pengajuan withdraw saat ini.</p>
              </div>
            }
          />
        </Card.Body>
      </Card>

      {/* Modal Edit/View */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedWd ? `Withdraw #${selectedWd.id}` : 'Detail Withdraw'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedWd && (
            <div className="row">
              <div className="col-md-6">
                <h6 className="fw-semibold mb-3">📋 Informasi User</h6>
                <div className="mb-2">
                  <small className="text-muted">Nama User</small>
                  <div className="fw-semibold">{selectedWd.user?.name || "N/A"}</div>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Username</small>
                  <div className="fw-semibold">@{selectedWd.user?.username}</div>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Email</small>
                  <div className="fw-semibold">{selectedWd.user?.email}</div>
                </div>
                
                <h6 className="fw-semibold mb-3 mt-4">💰 Informasi Withdraw</h6>
                <div className="mb-2">
                  <small className="text-muted">Nominal</small>
                  <div className="fw-bold text-success fs-5">
                    Rp {parseFloat(selectedWd.nominal).toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Tanggal Pengajuan</small>
                  <div className="fw-semibold">
                    {new Date(selectedWd.created_at).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <h6 className="fw-semibold mb-3">🏦 Informasi Bank</h6>
                <div className="mb-2">
                  <small className="text-muted">Nama Bank</small>
                  <div className="fw-semibold">{selectedWd.bank_name}</div>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Nomor Rekening</small>
                  <div className="fw-semibold">{selectedWd.bank_account_number}</div>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Nama Pemilik</small>
                  <div className="fw-semibold">{selectedWd.bank_account_holder}</div>
                </div>

                <Form className="mt-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Status Withdraw</Form.Label>
                    <Form.Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="pending">Menunggu</option>
                      <option value="processing">Diproses</option>
                      <option value="completed">Selesai</option>
                      <option value="rejected">Ditolak</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Waktu Proses (Hari)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={formData.processing_time}
                      onChange={(e) => setFormData({ ...formData, processing_time: parseInt(e.target.value) || 0 })}
                      placeholder="Estimasi waktu proses"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Catatan Admin</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.admin_notes}
                      onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                      placeholder="Berikan catatan untuk user..."
                    />
                  </Form.Group>
                </Form>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Tutup
          </Button>
          <Button variant="primary" onClick={handleUpdate} disabled={updating}>
            {updating ? (
              <>
                <Spinner size="sm" className="me-2" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* CSS untuk spinner */}
      <style>
        {`
          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Container>
  );
};

export default WdManagement;