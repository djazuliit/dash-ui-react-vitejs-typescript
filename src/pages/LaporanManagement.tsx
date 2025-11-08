import { useEffect, useState } from "react";
import { Button, Card, Container, Modal, Alert, Badge, Row, Col, Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import api from "../api/axios";
import { FaFileExcel, FaEye } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const LaporanManagement = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [alert, setAlert] = useState<{ show: boolean; message: string; type: 'success' | 'danger' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // State untuk filter - menggunakan undefined instead of null
  const [reportType, setReportType] = useState<'wa-accounts' | 'wd-management'>('wa-accounts');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const userId = localStorage.getItem("user_id");
  const userLevel = localStorage.getItem("user_level");

  // 🔹 Ambil data laporan
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString().split('T')[0];
      if (endDate) params.endDate = endDate.toISOString().split('T')[0];
      if (statusFilter) params.status = statusFilter;

      console.log(`🔄 Fetching ${reportType} data...`, params);
      
      const res = await api.get(`/reports/${reportType}`, {
        params,
        headers: { 
          "x-user-id": userId, 
          "x-user-level": userLevel 
        },
      });
      
      console.log("✅ Data received:", res.data);
      setData(res.data.data || []);
      setFilteredData(res.data.data || []);
    } catch (err: any) {
      console.error("❌ Gagal ambil data laporan:", err);
      showAlert("Gagal memuat data laporan. Pastikan server berjalan dengan benar", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [reportType, userId, userLevel]);

  // 🔹 Tampilkan alert
  const showAlert = (message: string, type: 'success' | 'danger') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 5000);
  };

  // 🔹 Pencarian data
  const handleSearch = (keyword: string) => {
    const lower = keyword.toLowerCase();
    setFilteredData(
      data.filter((item) => {
        if (reportType === 'wa-accounts') {
          return (
            item.name?.toLowerCase().includes(lower) ||
            item.waId?.toLowerCase().includes(lower) ||
            item.status?.toLowerCase().includes(lower) ||
            item.disconnectReason?.toLowerCase().includes(lower)
          );
        } else {
          return (
            item.bankName?.toLowerCase().includes(lower) ||
            item.bankAccountHolder?.toLowerCase().includes(lower) ||
            item.status?.toLowerCase().includes(lower) ||
            item.adminNotes?.toLowerCase().includes(lower)
          );
        }
      })
    );
  };

  // 🔹 Buka modal detail
  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  // 🔹 Export ke Excel
  const handleExportExcel = async () => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString().split('T')[0];
      if (endDate) params.endDate = endDate.toISOString().split('T')[0];
      if (statusFilter) params.status = statusFilter;

      console.log(`📊 Exporting ${reportType} to Excel...`, params);

      const response = await api.get(`/reports/${reportType}/export`, {
        params,
        responseType: 'blob',
        headers: { 
          "x-user-id": userId, 
          "x-user-level": userLevel 
        },
      });

      // Create blob link untuk download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().getTime();
      const filename = `laporan-${reportType}-${timestamp}.xlsx`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showAlert("✅ File Excel berhasil diunduh!", "success");
    } catch (err: any) {
      console.error("❌ Gagal export Excel:", err);
      showAlert("❌ Gagal mengunduh file Excel", "danger");
    }
  };

  // 🔹 Format saldo menjadi Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // 🔹 Format tanggal
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString("id-ID");
  };

  // 🔹 Reset filter
  const handleResetFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStatusFilter('');
  };

  // 🔹 Kolom tabel untuk WA Accounts
  const waAccountsColumns = [
    { 
      name: "ID", 
      selector: (row: any) => row.id, 
      sortable: true, 
      width: "70px" 
    },
    {
      name: "User ID",
      selector: (row: any) => row.userId,
      sortable: true,
      width: "80px"
    },
    {
      name: "WA ID",
      selector: (row: any) => row.waId,
      sortable: true,
    },
    {
      name: "Nama",
      selector: (row: any) => row.name,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: any) => row.status,
      sortable: true,
      cell: (row: any) => (
        <Badge 
          bg={
            row.status === 'connected' ? 'success' : 
            row.status === 'disconnected' ? 'danger' : 
            'warning'
          }
        >
          {row.status}
        </Badge>
      ),
      width: "120px",
    },
    {
      name: "Saldo",
      selector: (row: any) => formatRupiah(row.saldo),
      sortable: true,
      width: "150px",
    },
    {
      name: "Dibuat",
      selector: (row: any) => formatDate(row.createdAt),
      sortable: true,
      width: "180px",
    },
    {
      name: "Terhubung",
      selector: (row: any) => formatDate(row.connectedAt),
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
        </div>
      ),
      width: "80px",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // 🔹 Kolom tabel untuk WD Management
  const wdManagementColumns = [
    { 
      name: "ID", 
      selector: (row: any) => row.id, 
      sortable: true, 
      width: "70px" 
    },
    {
      name: "User ID",
      selector: (row: any) => row.idUser,
      sortable: true,
      width: "80px"
    },
    {
      name: "Nominal",
      selector: (row: any) => formatRupiah(row.nominal),
      sortable: true,
      width: "150px",
    },
    {
      name: "Bank",
      selector: (row: any) => row.bankName,
      sortable: true,
    },
    {
      name: "Rekening",
      selector: (row: any) => row.bankAccountNumber,
      sortable: true,
    },
    {
      name: "Pemilik",
      selector: (row: any) => row.bankAccountHolder,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: any) => row.status,
      sortable: true,
      cell: (row: any) => (
        <Badge 
          bg={
            row.status === 'approved' ? 'success' : 
            row.status === 'rejected' ? 'danger' : 
            row.status === 'processing' ? 'warning' : 
            'secondary'
          }
        >
          {row.status}
        </Badge>
      ),
      width: "120px",
    },
    {
      name: "Dibuat",
      selector: (row: any) => formatDate(row.createdAt),
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
        </div>
      ),
      width: "80px",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // 🔹 Status options berdasarkan report type
  const statusOptions = {
    'wa-accounts': [
      { value: '', label: 'Semua Status' },
      { value: 'connected', label: 'Connected' },
      { value: 'disconnected', label: 'Disconnected' },
      { value: 'connecting', label: 'Connecting' }
    ],
    'wd-management': [
      { value: '', label: 'Semua Status' },
      { value: 'pending', label: 'Pending' },
      { value: 'processing', label: 'Processing' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ]
  };

  const currentColumns = reportType === 'wa-accounts' ? waAccountsColumns : wdManagementColumns;
  const currentStatusOptions = statusOptions[reportType];

  return (
    <Container fluid className="p-4 mt-3">
      {alert.show && (
        <Alert variant={alert.type} className="mb-3">
          {alert.message}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold">
            {reportType === 'wa-accounts' ? '📱 Laporan WA Accounts' : '💰 Laporan Withdrawal'}
          </h4>
          <p className="text-muted mb-0">
            {reportType === 'wa-accounts' 
              ? 'Kelola data akun WhatsApp' 
              : 'Kelola data permintaan withdrawal'}
          </p>
        </div>
        <Button 
          variant="success" 
          onClick={handleExportExcel}
          disabled={loading || data.length === 0}
        >
          <FaFileExcel className="me-2" />
          Export Excel
        </Button>
      </div>

      {/* Filter Section */}
      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Jenis Laporan</Form.Label>
                <Form.Select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value as any)}
                >
                  <option value="wa-accounts">WA Accounts</option>
                  <option value="wd-management">Withdrawal Management</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Tanggal Mulai</Form.Label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date || undefined)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="form-control"
                  placeholderText="Pilih tanggal"
                  dateFormat="dd/MM/yyyy"
                  isClearable
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Tanggal Akhir</Form.Label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date || undefined)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="form-control"
                  placeholderText="Pilih tanggal"
                  dateFormat="dd/MM/yyyy"
                  isClearable
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {currentStatusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <div className="d-flex gap-2 w-100">
                <Button 
                  variant="primary" 
                  onClick={fetchData}
                  className="flex-fill"
                >
                  Terapkan Filter
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={handleResetFilter}
                >
                  Reset
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <DataTable
            columns={currentColumns}
            data={filteredData}
            progressPending={loading}
            pagination
            highlightOnHover
            striped
            dense
            noDataComponent={
              <div className="text-center py-4">
                {loading ? "Memuat data..." : "Belum ada data laporan"}
              </div>
            }
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            subHeader
            subHeaderComponent={
              <input
                type="text"
                placeholder="🔍 Cari data..."
                className="form-control w-25"
                onChange={(e) => handleSearch(e.target.value)}
              />
            }
          />
        </Card.Body>
      </Card>

      {/* 🔹 Modal Detail */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Detail {reportType === 'wa-accounts' ? 'WA Account' : 'Withdrawal'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div className="row">
              {reportType === 'wa-accounts' ? (
                <>
                  <div className="col-md-6">
                    <h6>Informasi Akun WA</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>ID</strong></td>
                          <td>{selectedItem.id}</td>
                        </tr>
                        <tr>
                          <td><strong>User ID</strong></td>
                          <td>{selectedItem.userId}</td>
                        </tr>
                        <tr>
                          <td><strong>WA ID</strong></td>
                          <td>{selectedItem.waId}</td>
                        </tr>
                        <tr>
                          <td><strong>Nama</strong></td>
                          <td>{selectedItem.name}</td>
                        </tr>
                        <tr>
                          <td><strong>Status</strong></td>
                          <td>
                            <Badge 
                              bg={
                                selectedItem.status === 'connected' ? 'success' : 
                                selectedItem.status === 'disconnected' ? 'danger' : 
                                'warning'
                              }
                            >
                              {selectedItem.status}
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h6>Informasi Session</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Saldo</strong></td>
                          <td className="fw-bold text-success">{formatRupiah(selectedItem.saldo)}</td>
                        </tr>
                        <tr>
                          <td><strong>Dibuat</strong></td>
                          <td>{formatDate(selectedItem.createdAt)}</td>
                        </tr>
                        <tr>
                          <td><strong>Terhubung</strong></td>
                          <td>{formatDate(selectedItem.connectedAt)}</td>
                        </tr>
                        <tr>
                          <td><strong>Terputus</strong></td>
                          <td>{formatDate(selectedItem.disconnectedAt)}</td>
                        </tr>
                        <tr>
                          <td><strong>Alasan Putus</strong></td>
                          <td>{selectedItem.disconnectReason || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-md-6">
                    <h6>Informasi Withdrawal</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>ID</strong></td>
                          <td>{selectedItem.id}</td>
                        </tr>
                        <tr>
                          <td><strong>User ID</strong></td>
                          <td>{selectedItem.idUser}</td>
                        </tr>
                        <tr>
                          <td><strong>Nominal</strong></td>
                          <td className="fw-bold text-success">{formatRupiah(selectedItem.nominal)}</td>
                        </tr>
                        <tr>
                          <td><strong>Status</strong></td>
                          <td>
                            <Badge 
                              bg={
                                selectedItem.status === 'approved' ? 'success' : 
                                selectedItem.status === 'rejected' ? 'danger' : 
                                selectedItem.status === 'processing' ? 'warning' : 
                                'secondary'
                              }
                            >
                              {selectedItem.status}
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h6>Informasi Bank</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Bank</strong></td>
                          <td>{selectedItem.bankName}</td>
                        </tr>
                        <tr>
                          <td><strong>Nomor Rekening</strong></td>
                          <td>{selectedItem.bankAccountNumber}</td>
                        </tr>
                        <tr>
                          <td><strong>Pemilik</strong></td>
                          <td>{selectedItem.bankAccountHolder}</td>
                        </tr>
                        <tr>
                          <td><strong>Dibuat</strong></td>
                          <td>{formatDate(selectedItem.createdAt)}</td>
                        </tr>
                        <tr>
                          <td><strong>Catatan Admin</strong></td>
                          <td>{selectedItem.adminNotes || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
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
    </Container>
  );
};

export default LaporanManagement;