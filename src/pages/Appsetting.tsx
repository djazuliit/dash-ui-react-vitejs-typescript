import React, { useEffect, useState } from "react";
import { Card, Row, Col, Form, Button, Image, Spinner } from "react-bootstrap";

interface AppSettingsData {
  id?: number;
  nama_app: string;
  delay_min: number;
  delay_max: number;
  poin_per_success: number;
  pesan_wa_default: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  favicon: File | string | null;
  logo: File | string | null;
}

const AppSettings: React.FC = () => {
  const [data, setData] = useState<AppSettingsData>({
    nama_app: "",
    delay_min: 5000,
    delay_max: 8000,
    poin_per_success: 1,
    pesan_wa_default: "",
    smtp_host: "",
    smtp_port: 587,
    smtp_user: "",
    smtp_password: "",
    favicon: null,
    logo: null,
  });

  const [preview, setPreview] = useState<{ favicon: string | null; logo: string | null }>({
    favicon: null,
    logo: null,
  });

  const [loading, setLoading] = useState<boolean>(true);

  // 🔹 Ambil data setting pertama dari API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/app/first");
        const result = await res.json();
        if (result) {
          setData(result);
        }
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔹 Ganti file + preview
  const handleFileChange = (name: "favicon" | "logo", file: File | null) => {
    if (file) {
      setPreview((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
      setData((prev) => ({ ...prev, [name]: file }));
    } else {
      setPreview((prev) => ({ ...prev, [name]: null }));
      setData((prev) => ({ ...prev, [name]: null }));
    }
  };

  // 🔹 Simpan perubahan
  const handleSave = async () => {
    if (!data.id) return alert("Data belum dimuat!");

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value); // ✅ kirim sesuai nama field ('logo' atau 'favicon')
      } else if (value !== null) {
        formData.append(key, value.toString());
      }
    });

    try {
      const res = await fetch(`http://localhost:5000/app/${data.id}`, {
        method: "PUT",
        body: formData,
      });
      const result = await res.json();
      alert(result.message || "Pengaturan berhasil disimpan!");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan pengaturan!");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" /> <div>Memuat data...</div>
      </div>
    );
  }

  return (
    <Card className="shadow-sm border-0 p-4 rounded-3">
      <h5 className="mb-4">⚙️ Pengaturan Aplikasi</h5>
      <Form>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nama Aplikasi</Form.Label>
              <Form.Control
                type="text"
                value={data.nama_app}
                onChange={(e) => setData({ ...data, nama_app: e.target.value })}
                placeholder="Contoh: Djazuli IT"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Delay Min (ms)</Form.Label>
              <Form.Control
                type="number"
                value={data.delay_min}
                onChange={(e) => setData({ ...data, delay_min: Number(e.target.value) })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Delay Max (ms)</Form.Label>
              <Form.Control
                type="number"
                value={data.delay_max}
                onChange={(e) => setData({ ...data, delay_max: Number(e.target.value) })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Poin per Success</Form.Label>
              <Form.Control
                type="number"
                value={data.poin_per_success}
                onChange={(e) => setData({ ...data, poin_per_success: Number(e.target.value) })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Pesan WA Default</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={data.pesan_wa_default}
                onChange={(e) => setData({ ...data, pesan_wa_default: e.target.value })}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <h6 className="mt-2 mb-3">📧 Pengaturan SMTP</h6>

            <Form.Group className="mb-3">
              <Form.Label>SMTP Host</Form.Label>
              <Form.Control
                type="text"
                value={data.smtp_host}
                onChange={(e) => setData({ ...data, smtp_host: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>SMTP Port</Form.Label>
              <Form.Control
                type="number"
                value={data.smtp_port}
                onChange={(e) => setData({ ...data, smtp_port: Number(e.target.value) })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>SMTP User</Form.Label>
              <Form.Control
                type="text"
                value={data.smtp_user}
                onChange={(e) => setData({ ...data, smtp_user: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>SMTP Password</Form.Label>
              <Form.Control
                type="password"
                value={data.smtp_password}
                onChange={(e) => setData({ ...data, smtp_password: e.target.value })}
              />
            </Form.Group>

            
          </Col>
        </Row>

        <hr />
        <h6>🖼️ Upload Logo & Favicon</h6>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Favicon</Form.Label>
              <Form.Control
                type="file"
                accept=".ico,.png,.jpg,.jpeg,.gif,.svg"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFileChange("favicon", e.target.files?.[0] || null)
                }
              />
              {preview.favicon ? (
                <div className="mt-2 text-center">
                  <Image src={preview.favicon} width={40} height={40} />
                </div>
              ) : data.favicon ? (
                <div className="mt-2 text-center">
                  <Image
                    src={`http://localhost:5000/uploads/app/${data.favicon}`}
                    width={40}
                    height={40}
                  />
                </div>
              ) : null}
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Logo</Form.Label>
              <Form.Control
                type="file"
                accept=".png,.jpg,.jpeg,.gif,.svg"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFileChange("logo", e.target.files?.[0] || null)
                }
              />
              {preview.logo ? (
                <div className="mt-2 text-center">
                  <Image src={preview.logo} width={120} />
                </div>
              ) : data.logo ? (
                <div className="mt-2 text-center">
                  <Image
                    src={`http://localhost:5000/uploads/app/${data.logo}`}
                    width={120}
                  />
                </div>
              ) : null}
            </Form.Group>
          </Col>
        </Row>

        <div className="text-end">
          <Button variant="primary" onClick={handleSave}>
            💾 Simpan Pengaturan
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default AppSettings;
