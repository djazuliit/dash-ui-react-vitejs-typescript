// import node module libraries
import { Row, Col, Card, Form, Button, Image, Alert } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";

// import api
import api from "../../api/axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (!tokenParam || !emailParam) {
      setError('Link reset password tidak valid');
      return;
    }
    
    setToken(tokenParam);
    setEmail(emailParam);
  }, [searchParams]);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validasi
    if (password.length < 6) {
      setError('Password harus minimal 6 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (!token || !email) {
      setError('Link reset password tidak valid');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        token,
        email,
        newPassword: password
      });

      setSuccess('Password berhasil direset! Silakan login dengan password baru.');
      
      // Redirect ke halaman login setelah 3 detik
      setTimeout(() => {
        navigate('/auth/sign-in', { 
          state: { message: 'Password berhasil direset!' } 
        });
      }, 3000);

    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Terjadi kesalahan');
      } else {
        setError('Terjadi kesalahan saat reset password');
      }
    } finally {
      setLoading(false);
    }
  };

  if (error && (!token || !email)) {
    return (
      <Row className="align-items-center justify-content-center g-0 min-vh-100 bg-light">
        <Col xxl={4} lg={6} md={8} xs={12} className="py-8 py-xl-0">
          <Card className="smooth-shadow-md border-0">
            <Card.Body className="p-6 text-center">
              <Alert variant="danger">
                {error}
              </Alert>
              <Link to="/auth/forgot-password" className="btn btn-primary">
                Minta Link Reset Baru
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

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
                Buat password baru untuk akun Anda
              </p>
            </div>

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

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password Baru</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Masukkan password baru"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                />
                <Form.Text className="text-muted">
                  Password harus minimal 6 karakter
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-4" controlId="confirmPassword">
                <Form.Label>Konfirmasi Password Baru</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Konfirmasi password baru"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                />
              </Form.Group>

              <div className="d-grid mb-3">
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={loading}
                  className="fw-bold"
                >
                  {loading ? 'Memproses...' : 'Reset Password'}
                </Button>
              </div>

              <div className="text-center">
                <Link to="/auth/sign-in" className="text-inherit fs-6">
                  Kembali ke Login
                </Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ResetPassword;