import { useEffect, useState } from "react";
import { Button, Card, Container, Modal, Alert, Badge } from "react-bootstrap";
import DataTable from "react-data-table-component";
import api from "../api/axios";
import { FaTrash,  FaEye } from "react-icons/fa";

const UserManagement = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [alert, setAlert] = useState<{ show: boolean; message: string; type: 'success' | 'danger' }>({
    show: false,
    message: '',
    type: 'success'
  });

  
  const userId = localStorage.getItem("user_id");
  const userLevel = localStorage.getItem("user_level");

  // 🔹 Ambil data user
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching data from /user...");
      
      const res = await api.get("/user", {
        headers: { 
          "x-user-id": userId, 
          "x-user-level": userLevel 
        },
      });
      
      console.log("✅ Data received:", res.data);
      setData(res.data);
      setFilteredData(res.data);
    } catch (err: any) {
      console.error("❌ Gagal ambil data user:", err);
      console.error("❌ Error details:", {
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      showAlert("Gagal memuat data user. Pastikan server berjalan dengan benar", "danger");
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

  // 🔹 Pencarian data user
  const handleSearch = (keyword: string) => {
    const lower = keyword.toLowerCase();
    setFilteredData(
      data.filter(
        (item) =>
          item.name?.toLowerCase().includes(lower) ||
          item.username?.toLowerCase().includes(lower) ||
          item.email?.toLowerCase().includes(lower) ||
          item.phone?.toLowerCase().includes(lower) ||
          item.level?.toLowerCase().includes(lower)
      )
    );
  };
  

  // 🔹 Buka modal detail user
  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  // 🔹 Buka modal konfirmasi delete
  const handleDeleteClick = (user: any) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // 🔹 Hapus user
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      console.log(`🔄 Deleting user ${selectedUser.id}...`);
      
      await api.delete(`/user/${selectedUser.id}`, {
        headers: { 
          "x-user-id": userId, 
          "x-user-level": userLevel 
        },
      });

      showAlert("✅ User berhasil dihapus!", "success");
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchData();
    } catch (err: any) {
      console.error("❌ Gagal menghapus user:", err);
      showAlert("❌ Gagal menghapus user: " + (err.response?.data?.message || err.message), "danger");
    }
  };

  // 🔹 Format saldo menjadi Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // 🔹 Kolom tabel
  const columns = [
    { 
      name: "ID", 
      selector: (row: any) => row.id, 
      sortable: true, 
      width: "70px" 
    },
    {
      name: "Nama",
      selector: (row: any) => row.name,
      sortable: true,
    },
    {
      name: "Username",
      selector: (row: any) => row.username,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row: any) => row.email,
      sortable: true,
    },
    {
      name: "Nomor HP",
      selector: (row: any) => row.phone,
      sortable: true,
    },
    {
      name: "Level",
      selector: (row: any) => row.level,
      sortable: true,
      cell: (row: any) => (
        <Badge 
          bg={row.level === 'admin' ? 'danger' : row.level === 'superadmin' ? 'dark' : 'primary'}
        >
          {row.level}
        </Badge>
      ),
      width: "100px",
    },
    {
      name: "Saldo",
      selector: (row: any) => formatRupiah(row.saldo || 0),
      sortable: true,
      width: "150px",
    },
    {
      name: "Status",
      selector: (row: any) => row.isVerified ? 'Verified' : 'Unverified',
      sortable: true,
      cell: (row: any) => (
        <Badge bg={row.isVerified ? 'success' : 'warning'}>
          {row.isVerified ? 'Verified' : 'Unverified'}
        </Badge>
      ),
      width: "100px",
    },
    {
      name: "Dibuat",
      selector: (row: any) =>
        new Date(row.createdAt).toLocaleString("id-ID"),
      sortable: true,
      width: "180px",
    },
    {
      name: "Aksi",
      cell: (row: any) => (
        <div className="d-flex gap-2">
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => handleViewDetails(row)}
            title="Lihat Detail"
          >
            <FaEye />
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleDeleteClick(row)}
            title="Hapus User"
          >
            <FaTrash />
          </Button>
        </div>
      ),
      width: "120px",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // 🔹 Test koneksi manual
  const testConnection = async () => {
    try {
      const res = await api.get("/user");
      console.log("✅ Connection test successful:", res.status);
      showAlert("Koneksi ke server berhasil!", "success");
    } catch (err) {
      console.error("❌ Connection test failed:", err);
      showAlert("Koneksi ke server gagal! Pastikan server berjalan dengan benar", "danger");
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
          <h4 className="fw-bold">👥 Manajemen User</h4>
          <p className="text-muted mb-0">Kelola data pengguna sistem</p>
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
                {loading ? "Memuat data..." : "Belum ada data user"}
              </div>
            }
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            subHeader
            subHeaderComponent={
              <input
                type="text"
                placeholder="🔍 Cari user..."
                className="form-control w-25"
                onChange={(e) => handleSearch(e.target.value)}
              />
            }
          />
        </Card.Body>
      </Card>

      

      {/* 🔹 Modal Detail User */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detail User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="row">
              <div className="col-md-6">
                <h6>Informasi Pribadi</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>ID</strong></td>
                      <td>{selectedUser.id}</td>
                    </tr>
                    <tr>
                      <td><strong>Nama</strong></td>
                      <td>{selectedUser.name}</td>
                    </tr>
                    <tr>
                      <td><strong>Username</strong></td>
                      <td>{selectedUser.username}</td>
                    </tr>
                    <tr>
                      <td><strong>Email</strong></td>
                      <td>{selectedUser.email}</td>
                    </tr>
                    <tr>
                      <td><strong>Nomor HP</strong></td>
                      <td>{selectedUser.phone}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <h6>Informasi Akun</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>Level</strong></td>
                      <td>
                        <Badge 
                          bg={selectedUser.level === 'admin' ? 'danger' : selectedUser.level === 'superadmin' ? 'dark' : 'primary'}
                        >
                          {selectedUser.level}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Saldo</strong></td>
                      <td className="fw-bold text-success">{formatRupiah(selectedUser.saldo || 0)}</td>
                    </tr>
                    <tr>
                      <td><strong>Status</strong></td>
                      <td>
                        <Badge bg={selectedUser.isVerified ? 'success' : 'warning'}>
                          {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Dibuat</strong></td>
                      <td>{new Date(selectedUser.createdAt).toLocaleString("id-ID")}</td>
                    </tr>
                    <tr>
                      <td><strong>Diupdate</strong></td>
                      <td>{new Date(selectedUser.updatedAt).toLocaleString("id-ID")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {(selectedUser.bank_name || selectedUser.bank_account_number) && (
                <div className="col-12 mt-3">
                  <h6>Informasi Bank</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Nama Bank</strong></td>
                        <td>{selectedUser.bank_name || '-'}</td>
                      </tr>
                      <tr>
                        <td><strong>Nomor Rekening</strong></td>
                        <td>{selectedUser.bank_account_number || '-'}</td>
                      </tr>
                      <tr>
                        <td><strong>Nama Pemilik</strong></td>
                        <td>{selectedUser.bank_account_holder || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 🔹 Modal Konfirmasi Hapus */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Hapus User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Apakah Anda yakin ingin menghapus user ini?</p>
          <div className="bg-light p-3 rounded">
            <strong>ID:</strong> {selectedUser?.id}<br />
            <strong>Nama:</strong> {selectedUser?.name}<br />
            <strong>Username:</strong> {selectedUser?.username}<br />
            <strong>Email:</strong> {selectedUser?.email}
          </div>
          <Alert variant="danger" className="mt-3">
            <small>
              <strong>Peringatan!</strong> Data yang dihapus tidak dapat dikembalikan. 
              Semua data terkait user ini juga akan hilang.
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            <FaTrash className="me-1" />
            Hapus User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement;