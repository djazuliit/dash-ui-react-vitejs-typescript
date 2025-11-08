import { v4 as uuid } from "uuid";
import { DashboardMenuProps } from "types";

export const getDashboardMenu = (userLevel: number): DashboardMenuProps[] => {
  const baseMenu: DashboardMenuProps[] = [
    {
      id: uuid(),
      title: "Dashboard",
      icon: "home", // ikon beranda utama
      link: "/",
    },
    {
      id: uuid(),
      title: "MENU",
      grouptitle: true,
    },
    {
      id: uuid(),
      title: "Akun Whatsapp",
      icon: "message-circle", // ikon chat
      link: "/pages/akunwa",
    },
    {
      id: uuid(),
      title: "Profil",
      icon: "user", // ikon profil pengguna
      link: "/pages/profile",
    },
  ];

  if (userLevel === 1) {
    // Menu khusus admin
    baseMenu.push(
      {
        id: uuid(),
        title: "Target",
        icon: "target", // ikon target atau sasaran
        link: "/pages/target",
      },
      {
        id: uuid(),
        title: "WD Manajement",
        icon: "settings", // ikon roda gigi
        link: "/pages/wdmanagement",
      },
      {
        id: uuid(),
        title: "WD Setting",
        icon: "settings", // ikon roda gigi
        link: "/pages/wdsettings",
      },
      {
        id: uuid(),
        title: "Manajemen Pengguna",
        icon: "users", // ikon kelompok pengguna
        link: "/pages/usermanagement",
      },
      {
        id: uuid(),
        title: "Laporan",
        icon: "bar-chart-2",
        link: "/pages/laporanmanagement",
      },
      {
        id: uuid(),
        title: "Pengaturan",
        icon: "settings", // ikon roda gigi
        link: "/pages/appsetting",
      }
    );
  } else {
    // Menu khusus user biasa
    baseMenu.push({
      id: uuid(),
      title: "Withdraw",
      icon: "credit-card", // ikon kartu untuk transaksi
      link: "/pages/wduser",
    });
  }

  return baseMenu;
};
