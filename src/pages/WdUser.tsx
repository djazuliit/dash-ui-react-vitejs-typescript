import { useEffect, useState } from "react";
import { Button, Card, Container, Form, Alert, Spinner } from "react-bootstrap";
import DataTable from "react-data-table-component";
import api from "../api/axios";
import { FaPaperPlane, FaExclamationTriangle } from "react-icons/fa";

const WdUser = () => {
  const [wdSettings, setWdSettings] = useState<any[]>([]);
  const [bankInfo, setBankInfo] = useState<any>(null);
  const [wdHistory, setWdHistory] = useState<any[]>([]);
  const [saldo, setSaldo] = useState<number>(0);

  const [selectedNominal, setSelectedNominal] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [alert, setAlert] = useState<{ show: boolean; message: string; type: "success" | "danger" }>({
    show: false,
    message: "",
    type: "success",
  });

  const userId = localStorage.getItem("user_id");
  const userLevel = localStorage.getItem("user_level");

  // 🔹 Alert handler
  const showAlert = (message: string, type: "success" | "danger") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 4000);
  };

  // 🔹 Ambil data awal - DIPERBAIKI
  const fetchData = async () => {
    try {
      setLoading(true);

      // 1️⃣ Ambil WD Settings (pilihan nominal)
      const settingRes = await api.get("/wd/settings", {
        headers: { "x-user-id": userId, "x-user-level": userLevel },
      });
      console.log("🔍 WD Settings Response:", settingRes.data);
      // Ambil data dari response.data.data (format backend)
      setWdSettings(settingRes.data.data || settingRes.data);

      // 2️⃣ Ambil data user (bank info + saldo) - DIPERBAIKI ENDPOINT
      const userRes = await api.get(`/user/${userId}`, { // ✅ /users bukan /user
        headers: { "x-user-id": userId, "x-user-level": userLevel },
      });
      console.log("🔍 User data:", userRes.data);
      // Ambil data dari response.data.data
      const userData = userRes.data.data || userRes.data;
      setBankInfo(userData);
      setSaldo(parseFloat(userData.saldo) || 0);

      // 3️⃣ Ambil riwayat WD user - DIPERBAIKI
      const wdRes = await api.get(`/wd/user/${userId}`, {
        headers: { "x-user-id": userId, "x-user-level": userLevel },
      });
      console.log("🔍 WD History:", wdRes.data);
      // Ambil data dari response.data.data
      setWdHistory(wdRes.data.data || wdRes.data);
    } catch (err: any) {
      console.error("❌ Gagal ambil data:", err);
      console.error("❌ Error details:", err.response?.data);
      showAlert("Gagal memuat data WD.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  // 🔹 Handle perubahan nominal
  const handleNominalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log("🎯 Selected nominal:", value);
    setSelectedNominal(value);
  };

  // 🔹 Validasi form sebelum submit
  const validateForm = (): boolean => {
    if (!selectedNominal) {
      showAlert("Pilih nominal penarikan terlebih dahulu!", "danger");
      return false;
    }

    if (!bankInfo?.bank_name || !bankInfo?.bank_account_number || !bankInfo?.bank_account_holder) {
      showAlert("Data bank Anda belum lengkap. Silakan lengkapi di profil.", "danger");
      return false;
    }

    const nominalValue = parseFloat(selectedNominal);
    if (saldo < nominalValue) {
      showAlert("Saldo Anda tidak mencukupi untuk penarikan ini.", "danger");
      return false;
    }

    if (nominalValue <= 0) {
      showAlert("Nominal penarikan harus lebih dari 0!", "danger");
      return false;
    }

    return true;
  };

  // 🔹 Ajukan WD - DIPERBAIKI ERROR HANDLING
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        id_user: parseInt(userId!),
        nominal: parseFloat(selectedNominal),
        bank_name: bankInfo.bank_name,
        bank_account_number: bankInfo.bank_account_number,
        bank_account_holder: bankInfo.bank_account_holder,
      };

      console.log("📤 Payload WD:", payload);

      const response = await api.post(
        "/wd",
        payload,
        {
          headers: { 
            "x-user-id": userId, 
            "x-user-level": userLevel 
          },
        }
      );

      console.log("✅ WD Response:", response.data);

      showAlert("✅ Pengajuan WD berhasil dikirim! Menunggu verifikasi admin.", "success");
      setSelectedNominal("");
      fetchData(); // Refresh data
    } catch (err: any) {
      console.error("❌ Gagal ajukan WD:", err);
      console.error("❌ Error response:", err.response?.data);
      
      const errorMessage = err.response?.data?.message || "Gagal mengajukan WD. Silakan coba lagi.";
      showAlert(errorMessage, "danger");
    } finally {
      setSubmitting(false);
    }
  };

  // 🔹 Cek apakah data bank lengkap
  const isBankDataComplete = bankInfo?.bank_name && 
                           bankInfo?.bank_account_number && 
                           bankInfo?.bank_account_holder;

  // 🔹 Kolom tabel dengan kondisional tampilan berdasarkan role
// 🔹 Kolom tabel riwayat WD yang lengkap
const columns = [
  {
    name: "ID",
    selector: (row: any) => row.id,
    width: "80px",
    sortable: true,
    center: true
  },
  {
    name: "User",
    cell: (row: any) => (
      <div>
        <div className="fw-semibold">{row.user?.name || "N/A"}</div>
        <small className="text-muted">@{row.user?.username}</small>
        <div className="text-muted small">{row.user?.email}</div>
      </div>
    ),
    minWidth: "200px"
  },
  {
    name: "Nominal",
    selector: (row: any) => parseFloat(row.nominal),
    cell: (row: any) => (
      <div className="text-success fw-bold">
        Rp {parseFloat(row.nominal).toLocaleString("id-ID")}
      </div>
    ),
    sortable: true,
    width: "150px"
  },
  {
    name: "Bank",
    cell: (row: any) => (
      <div>
        <div className="fw-semibold">{row.bank_name}</div>
        <small className="text-muted">{row.bank_account_number}</small>
        <div className="text-muted small">{row.bank_account_holder}</div>
      </div>
    ),
    minWidth: "200px"
  },
  {
    name: "Status",
    selector: (row: any) => row.status,
    cell: (row: any) => (
      <span className={`badge ${
        row.status === 'completed' ? 'bg-success' :
        row.status === 'rejected' ? 'bg-danger' :
        row.status === 'processing' ? 'bg-warning text-dark' :
        'bg-secondary'
      }`}>
        {row.status === 'pending' ? 'Menunggu' : 
         row.status === 'processing' ? 'Diproses' :
         row.status === 'completed' ? 'Selesai' :
         row.status === 'rejected' ? 'Ditolak' : row.status}
      </span>
    ),
    sortable: true,
    width: "130px",
    center: true
  },
  {
    name: "Waktu Proses",
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
    width: "120px"
  },
  {
    name: "Tanggal Pengajuan",
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
    name: "Tanggal Update",
    selector: (row: any) => new Date(row.updated_at),
    cell: (row: any) => (
      <div>
        <div className="small fw-semibold">
          {new Date(row.updated_at).toLocaleDateString("id-ID")}
        </div>
        <div className="text-muted small">
          {new Date(row.updated_at).toLocaleTimeString("id-ID")}
        </div>
      </div>
    ),
    sortable: true,
    width: "150px"
  },
  {
    name: "Catatan Admin",
    selector: (row: any) => row.admin_notes || "-",
    wrap: true,
    cell: (row: any) => (
      <div style={{ whiteSpace: 'pre-wrap', maxWidth: '200px' }}>
        {row.admin_notes || "-"}
      </div>
    ),
    minWidth: "200px"
  }
];

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

  return (
    <Container fluid className="p-4 mt-3">
      {alert.show && <Alert variant={alert.type}>{alert.message}</Alert>}

      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-primary text-white">
          <strong>💸 Form Pengajuan Withdraw</strong>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {/* Saldo user */}
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Saldo Anda</strong>
              </Form.Label>
              <Form.Control 
                type="text" 
                value={`Rp ${saldo.toLocaleString("id-ID")}`} 
                readOnly 
                className="fw-bold fs-5 text-success"
              />
              <Form.Text className="text-muted">
                Saldo yang tersedia untuk penarikan
              </Form.Text>
            </Form.Group>

            {/* Nominal WD */}
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Pilih Nominal Penarikan</strong> <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={selectedNominal}
                onChange={handleNominalChange}
                required
                className={!selectedNominal ? "border-warning" : "border-success"}
              >
                <option value="">-- Pilih nominal penarikan --</option>
                {wdSettings.map((setting) => {
                  const nominalValue = setting.nominal_min || setting.nominal_min;
                  return (
                    <option 
                      key={setting.id} 
                      value={nominalValue?.toString() || nominalValue}
                    >
                      Rp {parseFloat(nominalValue).toLocaleString("id-ID")} - {setting.min_text || "No text"}
                    </option>
                  );
                })}
              </Form.Select>
              
              <div className="mt-2">
                {selectedNominal ? (
                  <Form.Text className="text-success fw-bold">
                    ✅ Terpilih: Rp {parseFloat(selectedNominal).toLocaleString("id-ID")}
                  </Form.Text>
                ) : (
                  <Form.Text className="text-warning">
                    ⚠️ Pilih nominal di atas
                  </Form.Text>
                )}
                
                <Form.Text className="text-muted d-block">
                  Tersedia {wdSettings.length} pilihan nominal
                </Form.Text>
              </div>
            </Form.Group>

            {/* Data bank */}
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Nama Bank</strong> <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control 
                type="text" 
                value={bankInfo?.bank_name || ""} 
                readOnly 
                className={!bankInfo?.bank_name ? "border-danger" : ""}
              />
              {!bankInfo?.bank_name && (
                <Form.Text className="text-danger">
                  <FaExclamationTriangle className="me-1" />
                  Nama bank belum diisi. Lengkapi di profil.
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Nomor Rekening</strong> <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control 
                type="text" 
                value={bankInfo?.bank_account_number || ""} 
                readOnly 
                className={!bankInfo?.bank_account_number ? "border-danger" : ""}
              />
              {!bankInfo?.bank_account_number && (
                <Form.Text className="text-danger">
                  <FaExclamationTriangle className="me-1" />
                  Nomor rekening belum diisi. Lengkapi di profil.
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Nama Pemilik Rekening</strong> <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control 
                type="text" 
                value={bankInfo?.bank_account_holder || ""} 
                readOnly 
                className={!bankInfo?.bank_account_holder ? "border-danger" : ""}
              />
              {!bankInfo?.bank_account_holder && (
                <Form.Text className="text-danger">
                  <FaExclamationTriangle className="me-1" />
                  Nama pemilik rekening belum diisi. Lengkapi di profil.
                </Form.Text>
              )}
            </Form.Group>

            {/* Warning jika data bank tidak lengkap */}
            {!isBankDataComplete && (
              <Alert variant="warning" className="d-flex align-items-center">
                <FaExclamationTriangle className="me-2" />
                <div>
                  <strong>Data bank belum lengkap!</strong> Silakan lengkapi data bank Anda di halaman profil sebelum melakukan penarikan.
                </div>
              </Alert>
            )}

            <Button 
              variant="success" 
              type="submit" 
              disabled={submitting || !isBankDataComplete || !selectedNominal || saldo < (parseFloat(selectedNominal) || 0)}
              className="w-100 py-2 fw-bold"
              size="lg"
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" /> 
                  Mengirim Pengajuan...
                </>
              ) : (
                <>
                  <FaPaperPlane className="me-2" /> 
                  Ajukan Penarikan
                </>
              )}
            </Button>

            {/* Info disabled state */}
            {(!isBankDataComplete || !selectedNominal || saldo < (parseFloat(selectedNominal) || 0)) && !submitting && (
              <Alert variant="info" className="mt-3 small">
                <strong>Perhatian:</strong> Tombol akan aktif ketika:
                <ul className="mb-0 mt-1">
                  {!isBankDataComplete && <li>Data bank sudah lengkap</li>}
                  {!selectedNominal && <li>Nominal penarikan sudah dipilih</li>}
                  {selectedNominal && saldo < parseFloat(selectedNominal) && (
                    <li>Saldo mencukupi untuk penarikan</li>
                  )}
                </ul>
              </Alert>
            )}
          </Form>
        </Card.Body>
      </Card>

      {/* Riwayat WD */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-secondary text-white">
          <strong>📜 Riwayat Penarikan Dana</strong>
        </Card.Header>
        <Card.Body>
          <DataTable
            columns={columns}
            data={wdHistory}
            progressPending={loading}
            pagination
            highlightOnHover
            dense
            noDataComponent={
              <div className="text-center py-5 text-muted">
                <FaExclamationTriangle size={32} className="mb-3" />
                <div>Belum ada riwayat penarikan dana</div>
              </div>
            }
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default WdUser;