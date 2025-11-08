//import node module libraries
import { Row, Col, Card, Form, Button, Image } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react"; // Tambahkan useEffect

//import custom hook
import { useMounted } from "hooks/useMounted";
import api from "../../api/axios"; // pastikan path sesuai

interface AppData {
  name_app: string;
  logo: string;
  // tambahkan properti lain sesuai response API
}

const SignIn = () => {
  const hasMounted = useMounted();
  const navigate = useNavigate();

  // State input
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [appData, setAppData] = useState<AppData | null>(null); // 🔹 Type the state
  const [logoLoading, setLogoLoading] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });

      // ✅ Simpan semua data user ke localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ Tambahkan user_id dan user_level agar dashboard bisa mengenali user
      localStorage.setItem("user_id", res.data.user.id);
      localStorage.setItem("user_level", res.data.user.level);

      // Arahkan ke halaman utama
      navigate("/");
    } catch (err: any) {
      alert(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAppData = async () => {
      try {
        const res = await api.get("/app/first");
        if (res.data) {
          setAppData(res.data);
        }
      } catch (err) {
        console.error("Gagal memuat data aplikasi:", err);
      } finally {
        setLogoLoading(false);
      }
    };

    fetchAppData();
  }, []);

  return (
    <Row className="align-items-center justify-content-center g-0 min-vh-100 bg-light">
      <Col xxl={4} lg={6} md={8} xs={12} className="py-8 py-xl-0">
        <Card className="smooth-shadow-md border-0">
          <Card.Body className="p-6">
            <div className="text-center mb-4">
              <Link to="/">
                {logoLoading ? (
                  <div className="mb-3" style={{ height: '40px' }}>
                    Loading...
                  </div>
                ) : appData?.logo ? (
                  <Image
                    src={`http://localhost:5000/uploads/app/${appData.logo}`}
                    className="mb-3"
                    alt="Logo"
                    height={40}
                    style={{ objectFit: 'contain' }}
                  />
                ) : (
                  <Image
                    src="/images/brand/logo/logo-primary.svg"
                    className="mb-3"
                    alt="Logo"
                    height={40}
                  />
                )}
              </Link>
              <p className="text-muted mb-4">
                Silakan masukkan informasi login Anda.
              </p>
            </div>

            {hasMounted && (
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>Username atau Email</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Masukkan username/email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-lg-flex justify-content-between align-items-center mb-4">
                  <Form.Check type="checkbox" id="rememberme" label="Ingat saya" />
                </div>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="fw-bold"
                  >
                    {loading ? "Memproses..." : "Masuk"}
                  </Button>
                </div>

                <div className="d-md-flex justify-content-between mt-4">
                  <div className="mb-2 mb-md-0">
                    <Link to="/auth/sign-up" className="fs-6">
                      Buat Akun Baru
                    </Link>
                  </div>
                  <div>
                    <Link to="/auth/forget-password" className="text-inherit fs-6">
                      Lupa Password?
                    </Link>
                  </div>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default SignIn;
