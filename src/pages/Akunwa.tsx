import { useEffect, useState, useRef } from "react";
import { Button, Card, Container, Modal, Alert, Spinner, Badge, ProgressBar } from "react-bootstrap";
import DataTable from "react-data-table-component";
import api from "../api/axios";
import { FaQrcode, FaSync, FaTrash, FaPlay, FaCheck, FaTimes, FaPlus } from "react-icons/fa";
import { QRCodeSVG } from 'qrcode.react';

const WaAccounts = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [selectedWaId, setSelectedWaId] = useState<string | null>(null);
  const [isNewAccount, setIsNewAccount] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);

  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: "success" | "danger" | "warning";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const userId = localStorage.getItem("user_id");
  const userLevel = localStorage.getItem("user_level");

  // 🔹 Alert handler
  const showAlert = (message: string, type: "success" | "danger" | "warning") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 5000);
  };

  // 🔹 Cleanup intervals
  const cleanupIntervals = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // 🔹 Ambil data akun WA
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wa/accounts", {
        headers: { "x-user-id": userId, "x-user-level": userLevel },
      });
      
      if (res.data.success) {
        setData(res.data.data);
        setFilteredData(res.data.data);
      } else {
        showAlert("Gagal memuat data akun WA", "danger");
      }
    } catch (err: any) {
      console.error("❌ Gagal ambil data akun WA:", err);
      showAlert("Gagal memuat data akun WA", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchData();
    }

    return () => {
      cleanupIntervals();
    };
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

  // 🔹 TAMBAH AKUN WA BARU
  const handleAddWA = () => {
    const newWaId = `wa_${Date.now()}`;
    setIsNewAccount(true);
    setSelectedWaId(newWaId);
    setShowModal(true);
    setQr(null);
    setStatus("⏳ Membuat sesi baru...");
    setConnectionProgress(0);

    handleGenerateQr(newWaId, true);
  };

  // 🔹 GENERATE QR CODE - IMPROVED VERSION
  const handleGenerateQr = async (waId: string, isNew = false) => {
    try {
      cleanupIntervals(); // Cleanup existing intervals
      
      setActionLoading(`qr-${waId}`);
      setSelectedWaId(waId);
      setShowModal(true);
      setQr(null);
      setConnectionProgress(0);
      
      if (isNew) {
        setStatus("⏳ Membuat akun baru...");
        setIsNewAccount(true);
      } else {
        setStatus("⏳ Generating QR code...");
        setIsNewAccount(false);
      }

      console.log(`🔄 Generating QR for: ${waId}, New: ${isNew}`);

      // ✅ Start progress bar simulation
      let progress = 0;
      progressIntervalRef.current = setInterval(() => {
        progress += 1;
        if (progress <= 95) {
          setConnectionProgress(progress);
        }
      }, 900); // Progress ke 95% dalam 90 detik

      const response = await api.post(`/wa/generate-qr/${waId}`, {
        userId: userId,
        isNewAccount: isNew
      });

      console.log('📦 QR Response:', response.data);

      if (response.data.success && response.data.data?.qrCode) {
        const qrString = response.data.data.qrCode;
        setQr(qrString);
        setStatus("📱 Scan QR code dengan WhatsApp Anda");
        setConnectionProgress(50); // Set ke 50% saat QR muncul
        console.log(`✅ QR generated successfully for: ${waId}`);
        
        // ✅ IMPROVED: Polling dengan interval yang lebih reasonable
        let pollCount = 0;
        const maxPolls = 40; // 40 x 5 detik = 3 menit 20 detik
        
        pollingIntervalRef.current = setInterval(async () => {
          try {
            pollCount++;
            
            // Update progress bar
            const progressValue = 50 + (pollCount / maxPolls * 45); // 50% to 95%
            setConnectionProgress(Math.min(progressValue, 95));
            
            const statusRes = await api.get(`/wa/check-connection/${waId}`, {
              headers: { "x-user-id": userId }
            });
            
            console.log(`🔍 Connection check ${pollCount}/${maxPolls}:`, statusRes.data);
            
            if (statusRes.data.success && statusRes.data.data.status === 'connected') {
              setStatus("✅ Connected! Menutup modal...");
              setConnectionProgress(100);
              
              cleanupIntervals();
              
              setTimeout(() => {
                setShowModal(false);
                setIsNewAccount(false);
                setQr(null);
                setConnectionProgress(0);
                fetchData();
                showAlert(`Akun ${waId} berhasil terhubung!`, "success");
              }, 2000);
            }
            
            // Update status message based on progress
            if (pollCount === 10) {
              setStatus("📱 Masih menunggu scan... Pastikan WhatsApp Anda sudah siap");
            } else if (pollCount === 20) {
              setStatus("⏳ Mohon bersabar, masih mencoba terhubung...");
            } else if (pollCount === 30) {
              setStatus("🔄 Hampir expired, segera scan QR code!");
            }
            
            if (pollCount >= maxPolls) {
              cleanupIntervals();
              setStatus("⏰ QR code expired. Silakan generate ulang.");
              setConnectionProgress(0);
              showAlert("QR code expired, silakan generate ulang", "warning");
            }
          } catch (error) {
            console.error("Error checking connection:", error);
          }
        }, 5000); // ✅ Cek setiap 5 detik (lebih reasonable)

      } else {
        cleanupIntervals();
        setStatus("❌ " + (response.data.message || 'Gagal generate QR'));
        setConnectionProgress(0);
        console.error(`❌ QR generation failed:`, response.data);
        showAlert(response.data.message || 'Gagal generate QR code', "danger");
      }
    } catch (err: any) {
      cleanupIntervals();
      console.error("❌ Gagal generate QR:", err);
      setStatus("❌ Gagal generate QR code");
      setConnectionProgress(0);
      showAlert("Gagal generate QR code", "danger");
    } finally {
      setActionLoading(null);
    }
  };

  // 🔹 Cek status connection
  const handleCheckStatus = async (waId: string) => {
    try {
      setActionLoading(`status-${waId}`);
      
      const response = await api.get(`/wa/check-connection/${waId}`, {
        headers: { "x-user-id": userId }
      });

      if (response.data.success) {
        const statusData = response.data.data;
        
        if (statusData.needsReconnect) {
          showAlert(`Akun ${waId} terputus, perlu scan QR code`, "warning");
        } else {
          showAlert(`Akun ${waId} status: ${statusData.status}`, "success");
        }
        
        fetchData();
      }
    } catch (err: any) {
      console.error("❌ Gagal cek status:", err);
      showAlert("Gagal cek status akun", "danger");
    } finally {
      setActionLoading(null);
    }
  };

  // 🔹 Logout/delete session
  const handleLogout = async (waId: string) => {
    if (!window.confirm(`Yakin ingin logout dari akun ${waId}?`)) return;

    try {
      setActionLoading(`logout-${waId}`);
      
      const response = await api.delete(`/wa/logout/${waId}`, {
        headers: { "x-user-id": userId }
      });

      if (response.data.success) {
        showAlert(`Berhasil logout dari ${waId}`, "success");
        fetchData();
      } else {
        showAlert(response.data.message, "danger");
      }
    } catch (err: any) {
      console.error("❌ Gagal logout:", err);
      showAlert("Gagal logout akun", "danger");
    } finally {
      setActionLoading(null);
    }
  };

  // 🔹 Start Blast
  const handleStartBlast = async (waId: string) => {
    // Cek status connection dulu
    try {
      const statusCheck = await api.get(`/wa/check-connection/${waId}`, {
        headers: { "x-user-id": userId }
      });

      if (!statusCheck.data.success || statusCheck.data.data.status !== 'connected') {
        showAlert(`Akun ${waId} tidak terhubung. Silakan reconnect terlebih dahulu.`, "warning");
        return;
      }
    } catch (error) {
      showAlert("Gagal mengecek status koneksi", "danger");
      return;
    }

    if (!window.confirm(`Mulai blast dengan akun: ${waId}?`)) return;

    try {
      setActionLoading(`blast-${waId}`);
      
      const response = await api.post("/blast/start", {
        userId: parseInt(userId!),
        waId: waId,
      });

      if (response.data.success) {
        showAlert(`✅ Blast dimulai untuk: ${waId}`, "success");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        showAlert(response.data.message, "danger");
      }
    } catch (err: any) {
      console.error("❌ Gagal memulai blast:", err);
      const errorMsg = err.response?.data?.message || "Gagal memulai blast";
      showAlert(errorMsg, "danger");
    } finally {
      setActionLoading(null);
    }
  };

  // 🔹 Format status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      connected: { variant: "success", icon: FaCheck, label: "Connected" },
      connecting: { variant: "warning", icon: FaSync, label: "Connecting" },
      disconnected: { variant: "danger", icon: FaTimes, label: "Disconnected" },
      inactive: { variant: "secondary", icon: FaTimes, label: "Inactive" }
    };

    const config = statusConfig[status] || { variant: "secondary", icon: FaTimes, label: status };
    const IconComponent = config.icon;

    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1">
        <IconComponent size={12} />
        {config.label}
      </Badge>
    );
  };

  // 🔹 Handle modal close
  const handleCloseModal = () => {
    cleanupIntervals();
    setShowModal(false);
    setIsNewAccount(false);
    setQr(null);
    setConnectionProgress(0);
    setStatus("");
  };

  // 🔹 Kolom DataTable
const columns = [
  { 
    name: "ID", 
    selector: (row: any) => row.id, 
    sortable: true, 
    width: "80px" 
  },
  {
    name: "User ID",
    selector: (row: any) => row.user_id,
    sortable: true,
    omit: userLevel !== "1",
    width: "100px"
  },
  { 
    name: "WA ID", 
    selector: (row: any) => row.wa_id, 
    sortable: true,
    width: "150px"
  },
  { 
    name: "Nama Akun", 
    selector: (row: any) => row.name || "-", 
    sortable: true,
    cell: (row: any) => (
      <div>
        <div className="fw-semibold">{row.name || "Unknown"}</div>
        {row.phone && <small className="text-muted">{row.phone}</small>}
      </div>
    )
  },
  {
    name: "Status",
    selector: (row: any) => row.status,
    cell: (row: any) => (
      <div className="d-flex align-items-center gap-2">
        {getStatusBadge(row.status)}
        {row.needs_reconnect && (
          <Badge bg="warning" text="dark">
            Need Reconnect
          </Badge>
        )}
      </div>
    ),
    sortable: true,
    width: "180px"
  },
  {
    name: "Saldo",
    selector: (row: any) => row.saldo || 0,
    cell: (row: any) => (
      <div className="text-success fw-bold">
        {row.saldo || 0} poin
      </div>
    ),
    sortable: true,
    width: "100px"
  },

  // ✅ Kolom Baru: Total Sukses
  {
    name: "Total Sukses",
    selector: (row: any) => row.total_success,
    cell: (row: any) => (
      <Badge bg="success" className="px-3 py-2">
        {row.total_success ?? 0}
      </Badge>
    ),
    sortable: true,
    width: "130px"
  },

  // ✅ Kolom Baru: Total Gagal
  {
    name: "Total Gagal",
    selector: (row: any) => row.total_failed,
    cell: (row: any) => (
      <Badge bg="danger" className="px-3 py-2">
        {row.total_failed ?? 0}
      </Badge>
    ),
    sortable: true,
    width: "130px"
  },

  {
    name: "Terhubung",
    selector: (row: any) => row.connected_at,
    cell: (row: any) => (
      <div className="small">
        {row.connected_at ? (
          new Date(row.connected_at).toLocaleDateString("id-ID")
        ) : (
          <span className="text-muted">-</span>
        )}
      </div>
    ),
    sortable: true,
    width: "120px"
  },
  {
    name: "Dibuat",
    selector: (row: any) => row.created_at,
    cell: (row: any) => (
      <div className="small">
        {new Date(row.created_at).toLocaleDateString("id-ID")}
      </div>
    ),
    sortable: true,
    width: "120px"
  },
  {
    name: "Aksi",
    cell: (row: any) => (
      <div className="d-flex gap-1 flex-wrap">
        {row.status === 'disconnected' || row.needs_reconnect ? (
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => handleGenerateQr(row.wa_id, false)}
            disabled={actionLoading === `qr-${row.wa_id}`}
            title="Connect/Reconnect"
          >
            {actionLoading === `qr-${row.wa_id}` ? (
              <Spinner size="sm" />
            ) : (
              <FaQrcode />
            )}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline-info"
            onClick={() => handleCheckStatus(row.wa_id)}
            disabled={actionLoading === `status-${row.wa_id}`}
            title="Check Status"
          >
            {actionLoading === `status-${row.wa_id}` ? (
              <Spinner size="sm" />
            ) : (
              <FaSync />
            )}
          </Button>
        )}

        <Button
          size="sm"
          variant="outline-success"
          onClick={() => handleStartBlast(row.wa_id)}
          disabled={actionLoading === `blast-${row.wa_id}` || row.status !== 'connected'}
          title={row.status !== 'connected' ? "Akun harus connected" : "Start Blast"}
        >
          {actionLoading === `blast-${row.wa_id}` ? (
            <Spinner size="sm" />
          ) : (
            <FaPlay />
          )}
        </Button>

        <Button
          size="sm"
          variant="outline-danger"
          onClick={() => handleLogout(row.wa_id)}
          disabled={actionLoading === `logout-${row.wa_id}`}
          title="Logout"
        >
          {actionLoading === `logout-${row.wa_id}` ? (
            <Spinner size="sm" />
          ) : (
            <FaTrash />
          )}
        </Button>
      </div>
    ),
    width: "200px",
    ignoreRowClick: true,
  },
];

  return (
    <Container fluid className="p-4 mt-3">
      {alert.show && <Alert variant={alert.type}>{alert.message}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">📱 WhatsApp Accounts</h2>
          <p className="text-muted mb-0">Kelola semua akun WhatsApp Anda</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={fetchData} disabled={loading}>
            <FaSync className={loading ? "spin" : ""} />
            {loading ? " Loading..." : " Refresh"}
          </Button>
          <Button variant="success" onClick={handleAddWA}>
            <FaPlus className="me-1" />
            Tambah Akun WA
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Akun</h6>
                  <h4 className="fw-bold mb-0">{data.length}</h4>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <span className="text-primary fs-4">📱</span>
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
                  <h6 className="text-muted mb-1">Connected</h6>
                  <h4 className="fw-bold mb-0 text-success">
                    {data.filter(a => a.status === 'connected').length}
                  </h4>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <span className="text-success fs-4">✅</span>
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
                  <h6 className="text-muted mb-1">Disconnected</h6>
                  <h4 className="fw-bold mb-0 text-danger">
                    {data.filter(a => a.status === 'disconnected').length}
                  </h4>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  <span className="text-danger fs-4">❌</span>
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
                  <h6 className="text-muted mb-1">Need Reconnect</h6>
                  <h4 className="fw-bold mb-0 text-warning">
                    {data.filter(a => a.needs_reconnect).length}
                  </h4>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <span className="text-warning fs-4">🔄</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0 fw-semibold">📋 Daftar Akun WhatsApp</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            data={filteredData}
            progressPending={loading}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            highlightOnHover
            striped
            responsive
            dense
            subHeader
            subHeaderComponent={
              <div className="d-flex justify-content-between align-items-center w-100">
                <input
                  type="text"
                  placeholder="🔍 Cari akun..."
                  className="form-control w-25"
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <small className="text-muted">
                  Menampilkan {filteredData.length} dari {data.length} akun
                </small>
              </div>
            }
            noDataComponent={
              <div className="text-center py-5 text-muted">
                <span className="fs-1">📱</span>
                <h5>Belum ada akun WhatsApp</h5>
                <p className="mb-0">
                  Klik tombol <strong>"Tambah Akun WA"</strong> untuk memulai
                </p>
              </div>
            }
          />
        </Card.Body>
      </Card>

      {/* 🔹 Modal Scan QR - IMPROVED VERSION */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            {isNewAccount ? 'Tambah Akun WA Baru' : `Connect ${selectedWaId}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {qr ? (
            <>
              <div className="border rounded p-4 bg-light mb-3 d-flex justify-content-center">
                <QRCodeSVG 
                  value={qr} 
                  size={256}
                  level="H"
                  includeMargin
                  style={{ 
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '10px',
                    backgroundColor: 'white'
                  }}
                />
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <ProgressBar 
                  now={connectionProgress} 
                  label={`${Math.round(connectionProgress)}%`}
                  variant={connectionProgress === 100 ? 'success' : connectionProgress > 70 ? 'warning' : 'info'}
                  animated
                  striped
                />
              </div>

              <p className="text-muted mb-2 fw-semibold">{status}</p>
              <small className="text-muted d-block mb-2">
                📱 Buka WhatsApp → Settings → Linked Devices → Link a Device → Scan QR Code
              </small>
              <div className="mt-3">
                <small className="text-info d-block">
                  🔒 QR code akan expired dalam 2 menit
                </small>
                <small className="text-warning d-block mt-1">
                  ⏳ Mohon tunggu setelah scan, jangan tutup modal ini
                </small>
              </div>
            </>
          ) : (
            <div className="py-4">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p className="mt-3 text-muted">{status}</p>
              {connectionProgress > 0 && (
                <div className="mt-3">
                  <ProgressBar 
                    now={connectionProgress} 
                    label={`${Math.round(connectionProgress)}%`}
                    variant="info"
                    animated
                    striped
                  />
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Tutup
          </Button>
          {qr && (
            <Button 
              variant="primary" 
              onClick={() => {
                const svgElement = document.querySelector('svg');
                if (svgElement) {
                  const svgData = new XMLSerializer().serializeToString(svgElement);
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  
                  img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);
                    const pngUrl = canvas.toDataURL("image/png");
                    const downloadLink = document.createElement("a");
                    downloadLink.href = pngUrl;
                    downloadLink.download = `qr-${selectedWaId}.png`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                  };
                  
                  img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                }
              }}
            >
              Download QR
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Container>
  );
};

export default WaAccounts;