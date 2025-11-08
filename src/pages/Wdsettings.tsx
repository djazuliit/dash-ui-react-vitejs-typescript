import { useEffect, useState } from "react";
import { Button, Card, Container, Modal, Form, Alert, Spinner, Row, Col } from "react-bootstrap";
import DataTable from "react-data-table-component";
import api from "../api/axios";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";

const WdSettings = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [alert, setAlert] = useState<{ show: boolean; message: string; type: "success" | "danger" }>({
    show: false,
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    nominal_min: "",
    nominal_max: "",
  });

  const [textPreview, setTextPreview] = useState({
    min_text: "",
    max_text: ""
  });

  const userId = localStorage.getItem("user_id");
  const userLevel = localStorage.getItem("user_level");

  // 🔹 Fungsi konversi angka ke text
  const convertToText = (number: number): string => {
    const units = ['', 'ribu', 'juta', 'miliar', 'triliun'];
    const numbers = [
      '', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan',
      'sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 
      'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'
    ];

    if (number === 0) return 'nol';
    if (number < 20) return numbers[number];

    let result = '';

    // Handle ribuan ke atas
    let unitIndex = 0;
    let num = number;

    while (num > 0) {
      const chunk = num % 1000;
      if (chunk !== 0) {
        let chunkText = '';
        
        // Ratusan
        const hundreds = Math.floor(chunk / 100);
        if (hundreds > 0) {
          chunkText += numbers[hundreds] + ' ratus ';
        }

        // Puluhan dan satuan
        const remainder = chunk % 100;
        if (remainder > 0) {
          if (remainder < 20) {
            chunkText += numbers[remainder];
          } else {
            const tens = Math.floor(remainder / 10);
            const ones = remainder % 10;
            chunkText += numbers[tens] + ' puluh';
            if (ones > 0) {
              chunkText += ' ' + numbers[ones];
            }
          }
        }

        // Tambah unit (ribu, juta, dll)
        if (unitIndex > 0) {
          // Handle khusus untuk "seribu"
          if (unitIndex === 1 && chunk === 1) {
            chunkText = 'se';
          }
          chunkText += units[unitIndex] + ' ';
        }

        result = chunkText.trim() + ' ' + result;
      }
      
      num = Math.floor(num / 1000);
      unitIndex++;
    }

    return result.trim();
  };

  // 🔹 Update text preview ketika nominal berubah
  useEffect(() => {
    const minNum = parseInt(formData.nominal_min) || 0;
    const maxNum = parseInt(formData.nominal_max) || 0;

    setTextPreview({
      min_text: minNum > 0 ? convertToText(minNum) : "",
      max_text: maxNum > 0 ? convertToText(maxNum) : ""
    });
  }, [formData.nominal_min, formData.nominal_max]);

  // 🔹 Ambil semua data WD Settings
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wd-settings", {
        headers: { "x-user-id": userId, "x-user-level": userLevel },
      });
      setData(res.data);
    } catch (err: any) {
      console.error("❌ Gagal ambil data WD Settings:", err);
      showAlert("Gagal memuat data WD Settings.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Alert handler
  const showAlert = (message: string, type: "success" | "danger") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 4000);
  };

  // 🔹 Buka modal tambah data
  const handleAdd = () => {
    setSelected(null);
    setFormData({ nominal_min: "", nominal_max: "" });
    setTextPreview({ min_text: "", max_text: "" });
    setShowModal(true);
  };

  // 🔹 Buka modal edit data
  const handleEdit = (row: any) => {
    setSelected(row);
    setFormData({
      nominal_min: row.nominal_min.toString(),
      nominal_max: row.nominal_max.toString(),
    });
    setShowModal(true);
  };

  // 🔹 Simpan data (tambah atau update)
  const handleSave = async () => {
    if (!formData.nominal_min) {
        showAlert("Nominal minimal dan maksimal wajib diisi!", "danger");
        return;
    }

    const minNum = parseInt(formData.nominal_min);
    
    // nominal_max tetap sebagai string/text, tidak di-parse ke number
    const maxNum = formData.nominal_max.trim();

    

    try {
      setSaving(true);

      const payload = {
        nominal_min: minNum,
        nominal_max: maxNum,
        min_text: textPreview.min_text,
        max_text: textPreview.max_text
      };

      if (selected) {
        await api.put(`/wd-settings/${selected.id}`, payload, {
          headers: { "x-user-id": userId, "x-user-level": userLevel },
        });
        showAlert("✅ Data berhasil diperbarui!", "success");
      } else {
        await api.post(`/wd-settings`, payload, {
          headers: { "x-user-id": userId, "x-user-level": userLevel },
        });
        showAlert("✅ Data berhasil ditambahkan!", "success");
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      console.error("❌ Gagal menyimpan data WD:", err);
      showAlert("Gagal menyimpan data WD.", "danger");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Buka modal hapus
  const handleDeleteClick = (row: any) => {
    setSelected(row);
    setShowDeleteModal(true);
  };

  // 🔹 Hapus data
  const handleDeleteConfirm = async () => {
    if (!selected) return;

    try {
      await api.delete(`/wd-settings/${selected.id}`, {
        headers: { "x-user-id": userId, "x-user-level": userLevel },
      });
      showAlert("✅ Data berhasil dihapus!", "success");
      setShowDeleteModal(false);
      fetchData();
    } catch (err: any) {
      console.error("❌ Gagal hapus data:", err);
      showAlert("Gagal menghapus data.", "danger");
    }
  };

  // 🔹 Kolom tabel
  const columns = [
    { 
      name: "ID", 
      selector: (row: any) => row.id, 
      width: "80px", 
      sortable: true 
    },
    { 
      name: "Nominal Minimal", 
      selector: (row: any) => `Rp ${row.nominal_min.toLocaleString("id-ID")}`,
      cell: (row: any) => (
        <div>
          <div>Rp {row.nominal_min.toLocaleString("id-ID")}</div>
          <small className="text-muted">{row.min_text}</small>
        </div>
      ),
      sortable: true 
    },
    { 
      name: "Nominal Maksimal", 
      selector: (row: any) => `Rp ${row.nominal_max.toLocaleString("id-ID")}`,
      cell: (row: any) => (
        <div>
          <div>Rp {row.nominal_max.toLocaleString("id-ID")}</div>
          <small className="text-muted">{row.max_text}</small>
        </div>
      ),
      sortable: true 
    },
    {
      name: "Diperbarui",
      selector: (row: any) => new Date(row.updated_at).toLocaleString("id-ID"),
      sortable: true,
      width: "180px",
    },
    {
      name: "Aksi",
      cell: (row: any) => (
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm" onClick={() => handleEdit(row)}>
            <FaEdit />
          </Button>
          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(row)}>
            <FaTrash />
          </Button>
        </div>
      ),
      width: "120px",
    },
  ];

  return (
    <Container fluid className="p-4 mt-3">
      {alert.show && <Alert variant={alert.type}>{alert.message}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">💰 Pengaturan WD Settings</h4>
        <Button variant="primary" onClick={handleAdd}>
          <FaPlus className="me-1" /> Tambah Nominal
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <DataTable
            columns={columns}
            data={data}
            progressPending={loading}
            pagination
            highlightOnHover
            dense
            noDataComponent={<div className="text-center py-3">Belum ada data WD Settings</div>}
          />
        </Card.Body>
      </Card>

      {/* 🔹 Modal Tambah/Edit */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selected ? "Edit WD Setting" : "Tambah WD Setting"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
  <Form.Label>Nominal Minimal (Rp)</Form.Label>
  <Form.Control
    type="number"
    value={formData.nominal_min}
    onChange={(e) => setFormData({ ...formData, nominal_min: e.target.value })}
    placeholder="Masukkan nominal minimal"
  />
</Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
  <Form.Label>Text Nominal Minimal</Form.Label>
  <Form.Control
    type="text"
    value={textPreview.min_text}
    onChange={(e) => setFormData({ ...formData, nominal_max: e.target.value })}
    readOnly
    placeholder="Text akan otomatis terisi"
  />
</Form.Group>
              </Col>
            </Row>

            {/* Preview Section */}
            {(textPreview.min_text || textPreview.max_text) && (
              <Card className="mt-3 border-warning">
                <Card.Header className="bg-warning text-dark">
                  <strong>Preview Text</strong>
                </Card.Header>
                <Card.Body>
                  {textPreview.min_text && (
                    <p>
                      <strong>Minimal:</strong> {textPreview.min_text} rupiah
                    </p>
                  )}
                  {textPreview.max_text && (
                    <p>
                      <strong>Maksimal:</strong> {textPreview.max_text} rupiah
                    </p>
                  )}
                </Card.Body>
              </Card>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" /> Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 🔹 Modal Konfirmasi Hapus */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Hapus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Yakin ingin menghapus data WD Setting ini?</p>
          <div className="bg-light p-3 rounded">
            <strong>Nominal Min:</strong> Rp {selected?.nominal_min?.toLocaleString("id-ID")} 
            {selected?.min_text && <><br/><small>({selected.min_text})</small></>} 
            <br />
            <strong>Nominal Max:</strong> Rp {selected?.nominal_max?.toLocaleString("id-ID")}
            {selected?.max_text && <><br/><small>({selected.max_text})</small></>}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            <FaTrash className="me-1" /> Hapus
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default WdSettings;