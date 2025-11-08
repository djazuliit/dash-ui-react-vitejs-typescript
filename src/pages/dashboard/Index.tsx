import { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  People,
  Whatsapp,
  Send,
  XCircle,
  Briefcase,
  Wallet,
} from "react-bootstrap-icons";
import api from "../../api/axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        const userLevel = localStorage.getItem("user_level");

        if (!userId || !userLevel) {
          console.warn("User belum login. Mengarahkan ke halaman login...");
          navigate("/auth/sign-in");
          return;
        }

        const res = await api.get(`/stats/dashboard`, {
          headers: {
            "x-user-id": userId,
            "x-user-level": userLevel,
          },
        });

        setStats(res.data);
      } catch (err) {
        console.error("❌ Gagal mengambil data dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading)
    return <p className="text-center mt-5">⏳ Memuat dashboard...</p>;
  if (!stats)
    return <p className="text-center text-danger mt-5">❌ Gagal memuat data</p>;

  const userLevel = localStorage.getItem("user_level");
  const isAdmin = userLevel === "1";

  return (
    <Container fluid className="mt-5 px-4">
      <motion.h3
        className="mb-4 fw-bold"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        📊 Dashboard
      </motion.h3>

      {/* ================= Kartu Statistik ================= */}
      <Row className="g-4">
        {isAdmin ? (
          <>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<People size={26} />}
              color="primary"
            />
            <StatCard
              title="Total Akun WA"
              value={stats.totalWa}
              icon={<Whatsapp size={26} />}
              color="success"
            />
            <StatCard
              title="WA Aktif"
              value={stats.waActive}
              icon={<Briefcase size={26} />}
              color="info"
            />
            <StatCard
              title="WA Non Aktif"
              value={stats.waInactive}
              icon={<Briefcase size={26} />}
              color="secondary"
            />
            <StatCard
              title="Pesan Terkirim"
              value={stats.sent}
              icon={<Send size={26} />}
              color="success"
            />
            <StatCard
              title="Pesan Gagal"
              value={stats.failed}
              icon={<XCircle size={26} />}
              color="danger"
            />
            <StatCard
              title="Level Pengguna"
              value={userLevel}
              icon={<People size={26} />}
              color="dark"
            />
          </>
        ) : (
          <>
            <StatCard
              title="WA Aktif"
              value={stats.waActive}
              icon={<Briefcase size={26} />}
              color="info"
            />
            <StatCard
              title="WA Non Aktif"
              value={stats.waInactive}
              icon={<Briefcase size={26} />}
              color="secondary"
            />
            <StatCard
              title="Pesan Terkirim"
              value={stats.sent}
              icon={<Send size={26} />}
              color="success"
            />
            <StatCard
              title="Pesan Gagal"
              value={stats.failed}
              icon={<XCircle size={26} />}
              color="danger"
            />
            <StatCard
              title="Saldo Saat Ini"
              value={`Rp ${Number(stats.saldo || 0).toLocaleString("id-ID")}`}
              icon={<Wallet size={26} />}
              color="warning"
            />
            <StatCard
              title="Level Pengguna"
              value={userLevel}
              icon={<People size={26} />}
              color="dark"
            />
          </>
        )}
      </Row>

      {/* ================= Tabel Recent Blasts ================= */}
      {stats.recentBlasts && (
        <motion.div
          className="mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h4 className="fw-bold mb-3">📬 Log Blast Terbaru</h4>
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  {isAdmin && <th>User ID</th>}
                  <th>Target</th>
                  <th>Pesan</th>
                  <th>Status</th>
                  <th>Error</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBlasts.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="text-center">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  stats.recentBlasts.map((log: any) => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      {isAdmin && <td>{log.user_id}</td>}
                      <td>{log.target_phone}</td>
                      <td className="text-truncate" style={{ maxWidth: 200 }}>
                        {log.message}
                      </td>
                      <td>
                        <span
                          className={`badge bg-${
                            log.status === "success" ? "success" : "danger"
                          }`}
                        >
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td>{log.error || "-"}</td>
                      <td>
                        {new Date(log.created_at).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </Container>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <Col xl={3} lg={4} md={6} xs={12}>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-sm border-0 p-3 text-center hover-shadow-sm">
        <div className={`text-${color} mb-2 fs-2`}>{icon}</div>
        <h6 className="mb-1 text-secondary">{title}</h6>
        <h4 className="fw-bold">{value}</h4>
      </Card>
    </motion.div>
  </Col>
);

export default Dashboard;
