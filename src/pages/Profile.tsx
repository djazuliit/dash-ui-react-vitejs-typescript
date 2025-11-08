import { useEffect, useState } from "react";
import { Button, Card, Container, Form, Alert, Spinner, Row, Col } from "react-bootstrap";
import api from "../api/axios";
import { FaSave, FaUser, FaPhone, FaCreditCard, FaIdCard, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";

const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [alert, setAlert] = useState<{ show: boolean; message: string; type: "success" | "danger" }>({
    show: false,
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    bank_name: "",
    bank_account_number: "",
    bank_account_holder: ""
  });

  const userId = localStorage.getItem("user_id");
  const userLevel = localStorage.getItem("user_level");

  // 🔹 Alert handler
  const showAlert = (message: string, type: "success" | "danger") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 4000);
  };

  // 🔹 Ambil data user
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/user/${userId}`, {
        headers: { "x-user-id": userId, "x-user-level": userLevel },
      });
      
      setUserData(res.data);
      setFormData({
        name: res.data.name || "",
        username: res.data.username || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        bank_name: res.data.bank_name || "",
        bank_account_number: res.data.bank_account_number || "",
        bank_account_holder: res.data.bank_account_holder || ""
      });
    } catch (err: any) {
      console.error("❌ Gagal ambil data user:", err);
      showAlert("Gagal memuat data profil.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // 🔹 Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 🔹 Update profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi data bank jika diisi
    if (formData.bank_name || formData.bank_account_number || formData.bank_account_holder) {
      if (!formData.bank_name || !formData.bank_account_number || !formData.bank_account_holder) {
        showAlert("Lengkapi semua data bank jika ingin mengisi!", "danger");
        return;
      }
    }

    try {
      setSaving(true);

      // Siapkan payload untuk update
      const payload = {
        name: formData.name,
        phone: formData.phone,
        bank_name: formData.bank_name,
        bank_account_number: formData.bank_account_number,
        bank_account_holder: formData.bank_account_holder
        // username dan email biasanya tidak diubah
      };

      await api.put(`/user/${userId}`, payload, {
        headers: { "x-user-id": userId, "x-user-level": userLevel },
      });

      showAlert("✅ Profil berhasil diperbarui!", "success");
      fetchUserData(); // Refresh data
    } catch (err: any) {
      console.error("❌ Gagal update profil:", err);
      const errorMessage = err.response?.data?.message || "Gagal memperbarui profil. Silakan coba lagi.";
      showAlert(errorMessage, "danger");
    } finally {
      setSaving(false);
    }
  };

  if (!userId) {
    return (
      <Container fluid className="p-4 mt-3">
        <Alert variant="danger">
          <FaExclamationTriangle className="me-2" />
          Anda harus login untuk mengakses halaman ini.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container fluid className="p-4 mt-3">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2">Memuat data profil...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 mt-3">
      {alert.show && <Alert variant={alert.type}>{alert.message}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">👤 Profil Pengguna</h4>
        <div className="text-muted">
          Level: <span className="badge bg-primary">{userData?.level === 1 ? 'Admin' : 'User'}</span>
        </div>
      </div>

      <Row>
        <Col md={8}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white">
              <strong>📝 Edit Profil</strong>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    {/* Informasi Pribadi */}
                    <h6 className="text-primary mb-3">
                      <FaUser className="me-2" />
                      Informasi Pribadi
                    </h6>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Nama Lengkap <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Masukkan nama lengkap"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        readOnly
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Username tidak dapat diubah
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        readOnly
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Email tidak dapat diubah
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaPhone className="me-2" />
                        Nomor Telepon
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Contoh: 081234567890"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    {/* Informasi Bank */}
                    <h6 className="text-success mb-3">
                      <FaCreditCard className="me-2" />
                      Informasi Bank (Untuk Withdraw)
                    </h6>

                    <Form.Group className="mb-3">
                      <Form.Label>Nama Bank <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="bank_name"
                        value={formData.bank_name}
                        onChange={handleInputChange}
                        placeholder="Contoh: BCA, Mandiri, BNI"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaIdCard className="me-2" />
                        Nomor Rekening <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="bank_account_number"
                        value={formData.bank_account_number}
                        onChange={handleInputChange}
                        placeholder="Masukkan nomor rekening"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Nama Pemilik Rekening <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="bank_account_holder"
                        value={formData.bank_account_holder}
                        onChange={handleInputChange}
                        placeholder="Nama sesuai rekening bank"
                      />
                    </Form.Group>

                    {/* Warning data bank */}
                    {(formData.bank_name || formData.bank_account_number || formData.bank_account_holder) && 
                     (!formData.bank_name || !formData.bank_account_number || !formData.bank_account_holder) && (
                      <Alert variant="warning" className="py-2">
                        <FaExclamationTriangle className="me-2" />
                        Lengkapi semua data bank untuk bisa melakukan withdraw!
                      </Alert>
                    )}
                  </Col>
                </Row>

                <hr />

                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">
                      Terakhir update: {userData?.updatedAt ? new Date(userData.updatedAt).toLocaleString('id-ID') : 'Belum pernah update'}
                    </small>
                  </div>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={saving}
                    className="px-4"
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {/* Informasi Saldo */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-success text-white">
              <strong>💰 Saldo</strong>
            </Card.Header>
            <Card.Body className="text-center">
              <h3 className="text-success fw-bold">
                Rp {userData?.saldo?.toLocaleString('id-ID') || '0'}
              </h3>
              <small className="text-muted">
                Saldo tersedia untuk withdraw
              </small>
            </Card.Body>
          </Card>

          {/* Informasi Akun */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-info text-white">
              <strong>
                <FaInfoCircle className="me-2" />
                Informasi Akun
              </strong>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong>Status:</strong>{' '}
                <span className={`badge ${userData?.isVerified ? 'bg-success' : 'bg-warning'}`}>
                  {userData?.isVerified ? 'Terverifikasi' : 'Belum Verifikasi'}
                </span>
              </div>
              <div className="mb-2">
                <strong>Member sejak:</strong>{' '}
                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('id-ID') : '-'}
              </div>
              <div>
                <strong>ID User:</strong> {userData?.id}
              </div>
            </Card.Body>
          </Card>

          {/* Catatan */}
          <Card className="shadow-sm border-0 mt-4">
            <Card.Body>
              <h6 className="text-warning">
                <FaExclamationTriangle className="me-2" />
                Catatan Penting
              </h6>
              <ul className="small text-muted mb-0">
                <li>Pastikan data bank sesuai dengan rekening Anda</li>
                <li>Data bank digunakan untuk proses withdraw</li>
                <li>Username dan email tidak dapat diubah</li>
                <li>Verifikasi diperlukan untuk fitur tertentu</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;