// import node module libraries
import { Row, Col, Card, Form, Button, Image, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState, ChangeEvent, FormEvent } from "react";

//import custom hook
import { useMounted } from "hooks/useMounted";
import api from "../../api/axios"; // pastikan path sesuai

const SignUp = () => {
  const hasMounted = useMounted();
  const navigate = useNavigate();
  
  // State untuk form data
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  // State untuk UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle input changes dengan type yang tepat
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission dengan type yang tepat
  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validasi dasar
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password harus minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      // Kirim request register ke backend menggunakan axios
      const res = await api.post("/auth/register", {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      // Jika registrasi berhasil
      setSuccess('Registrasi berhasil! Silakan cek email Anda untuk kode OTP.');
      
      // Redirect ke halaman verifikasi OTP setelah 2 detik
      setTimeout(() => {
        navigate('/auth/verify-otp', { 
          state: { 
            email: formData.email,
            message: 'Registrasi berhasil! Silakan masukkan kode OTP yang dikirim ke email Anda.' 
          } 
        });
      }, 2000);

    } catch (err: unknown) {
      // Type guard untuk error handling
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Terjadi kesalahan saat registrasi');
      } else {
        setError('Terjadi kesalahan saat registrasi');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="align-items-center justify-content-center g-0 min-vh-100 bg-light">
      <Col xxl={4} lg={6} md={8} xs={12} className="py-8 py-xl-0">
        <Card className="smooth-shadow-md border-0">
          <Card.Body className="p-6">
            <div className="text-center mb-4">
              <Link to="/">
                <Image
                  src="/images/brand/logo/logo-primary.svg"
                  className="mb-3"
                  alt="Logo"
                  height={40}
                />
              </Link>
              <p className="text-muted mb-4">
                Silakan masukkan informasi akun Anda.
              </p>
            </div>

            {/* Alert untuk error dan success */}
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert variant="success" className="mb-3">
                {success}
              </Alert>
            )}

            {hasMounted && (
              <Form onSubmit={handleRegister}>
                {/* Nama Lengkap */}
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Nama Lengkap</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Masukkan nama lengkap"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* Username */}
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Masukkan username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* Email */}
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Masukkan alamat email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* Phone */}
                <Form.Group className="mb-3" controlId="phone">
                  <Form.Label>Nomor Telepon</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    placeholder="Masukkan nomor telepon"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* Password */}
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="********"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <Form.Text className="text-muted">
                    Password harus minimal 6 karakter
                  </Form.Text>
                </Form.Group>

                {/* Confirm Password */}
                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Konfirmasi Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="********"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* Terms and Conditions */}
                <div className="mb-4">
                  <Form.Check type="checkbox" id="terms-checkbox">
                    <Form.Check.Input type="checkbox" required />
                    <Form.Check.Label>
                      Saya setuju dengan <Link to="#"> Syarat Layanan </Link> dan{" "}
                      <Link to="#"> Kebijakan Privasi.</Link>
                    </Form.Check.Label>
                  </Form.Check>
                </div>

                {/* Submit Button */}
                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                    className="fw-bold"
                  >
                    {loading ? "Memproses..." : "Daftar Akun"}
                  </Button>
                </div>

                {/* Links */}
                <div className="d-md-flex justify-content-between mt-4">
                  <div className="mb-2 mb-md-0">
                    <Link to="/auth/sign-in" className="fs-6">
                      Sudah punya akun? Masuk
                    </Link>
                  </div>
                  <div>
                    <Link
                      to="/auth/forget-password"
                      className="text-inherit fs-6"
                    >
                      Lupa password?
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

export default SignUp;