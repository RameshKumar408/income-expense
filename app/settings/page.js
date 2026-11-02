"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import PieChartIcon from "@mui/icons-material/PieChart";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FontDownloadOutlinedIcon from "@mui/icons-material/FontDownloadOutlined";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const FONT_OPTIONS = [
  { label: "Inter", value: "Inter" },
  { label: "DM Sans", value: "DM Sans" },
  { label: "Manrope", value: "Manrope" },
  { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans" },
];

export default function SettingsPage() {
  const [role, setRole] = useState();
  const [accounts, setAccounts] = useState([]);
  const [selectedFont, setSelectedFont] = useState("Inter");
  const router = useRouter();

  const logout = () => {
    var activeEmail = window.localStorage.getItem("activeAccount");
    var list = JSON.parse(window.localStorage.getItem("accounts") || "[]");
    if (list.length > 1) {
      var remaining = list.filter((a) => a.email != activeEmail);
      window.localStorage.setItem("accounts", JSON.stringify(remaining));
      var next = remaining[0];
      window.localStorage.setItem("token", next.token);
      window.localStorage.setItem("roles", next.role);
      window.localStorage.setItem("activeAccount", next.email);
      window.sessionStorage.setItem(
        "pendingToast",
        `Removed account. Switched to ${next.email}`,
      );
      window.location.reload();
    } else {
      window.localStorage.setItem("accounts", JSON.stringify([]));
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("roles");
      window.localStorage.removeItem("activeAccount");
      router.push("/");
    }
  };

  const addAccount = () => {
    router.push("/?add=1");
  };

  const handleFontChange = (e) => {
    const newFont = e.target.value;
    setSelectedFont(newFont);
    window.localStorage.setItem("appFont", newFont);
    window.sessionStorage.setItem("pendingToast", `Font changed to ${newFont}`);
    window.location.reload();
  };

  useEffect(() => {
    setRole(window.localStorage.getItem("roles"));
    setAccounts(JSON.parse(window.localStorage.getItem("accounts") || "[]"));
    const savedFont = window.localStorage.getItem("appFont") || "Inter";
    setSelectedFont(savedFont);
  }, []);

  return (
    <div className="create-detail-page">
      <main className="expense-shell settings-shell">
        <header className="settings-header">
          <span className="settings-title-icon">
            <img
              src="/icon.png"
              alt="Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                mixBlendMode: "screen",
                transform: "scale(1.3)",
              }}
            />
          </span>
          <h1>Settings</h1>
        </header>

        <section
          className="settings-font-section"
          style={{ marginBottom: "24px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "12px",
            }}
          >
            <FontDownloadOutlinedIcon
              sx={{ color: "#d4a017", fontSize: "22px" }}
            />
            <span
              style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff" }}
            >
              App Font
            </span>
          </div>

          <FormControl fullWidth>
            <Select
              value={selectedFont}
              onChange={handleFontChange}
              aria-label="Select App Font"
              sx={{
                color: "#ffffff",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                backdropFilter: "blur(16px) saturate(150%)",
                WebkitBackdropFilter: "blur(16px) saturate(150%)",
                boxShadow:
                  "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.4)",
                borderRadius: "14px",
                fontSize: { xs: "15px", sm: "17px" },
                fontWeight: 600,
                minHeight: "52px",
                transition: "all 0.3s ease",
                "& .MuiSelect-select": {
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(212, 160, 23, 0.45)",
                  borderWidth: "1.5px",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(212, 160, 23, 0.75)",
                },
                "&.Mui-focused": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  boxShadow:
                    "inset 0 1px 2px rgba(255, 255, 255, 0.15), 0 0 20px rgba(212, 160, 23, 0.25)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(212, 160, 23, 1)",
                  borderWidth: "1.5px",
                },
                "& .MuiSvgIcon-root": {
                  color: "#d4a017",
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: "rgba(20, 20, 20, 0.9)",
                    backdropFilter: "blur(20px) saturate(160%)",
                    WebkitBackdropFilter: "blur(20px) saturate(160%)",
                    color: "#ffffff",
                    border: "1px solid rgba(212, 160, 23, 0.3)",
                    borderRadius: "14px",
                    boxShadow: "0 12px 36px rgba(0, 0, 0, 0.6)",
                    mt: 1,
                    "& .MuiMenuItem-root": {
                      fontSize: "15px",
                      fontWeight: 600,
                      padding: "12px 20px",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(212, 160, 23, 0.15)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "rgba(212, 160, 23, 0.25)",
                        color: "#d4a017",
                        "&:hover": {
                          backgroundColor: "rgba(212, 160, 23, 0.3)",
                        },
                      },
                    },
                  },
                },
              }}
            >
              {FONT_OPTIONS.map((font) => (
                <MenuItem key={font.value} value={font.value}>
                  {font.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </section>

        <section
          className="settings-actions"
          aria-label="Account settings"
          style={{ marginBottom: "24px" }}
        >
          <button
            className="settings-action danger"
            type="button"
            onClick={logout}
          >
            <LogoutIcon />
            <span>{accounts.length > 1 ? "Remove account" : "Logout"}</span>
          </button>

          <button
            className="settings-action"
            type="button"
            onClick={addAccount}
          >
            <PersonAddIcon />
            <span>Add account</span>
          </button>
        </section>

        <div
          style={{
            textAlign: "right",
            marginTop: "12px",
            marginRight: "4px",
            color: "rgba(255,255,255,0.4)",
            fontSize: "12px",
            fontWeight: "500",
          }}
        >
          Version 1.05
        </div>

        <nav className="bottom-nav" aria-label="Main actions">
          <Link
            className="bottom-nav-item"
            href="/createDetail"
            aria-label="Create details"
          >
            <HomeOutlinedIcon />
          </Link>
          {role == "admin" && (
            <Link
              className="bottom-nav-item"
              href="/authorize"
              aria-label="Google drive"
            >
              <ExploreOutlinedIcon />
            </Link>
          )}
          <Link
            className="bottom-nav-item"
            href="/viewDetails"
            aria-label="History"
          >
            <SearchIcon />
          </Link>
          {/* <Link className='bottom-nav-item' href='/details' aria-label='Analytics'>
                        <PieChartIcon />
                    </Link> */}
          <Link
            className="bottom-nav-item active"
            href="/settings"
            aria-label="Settings"
          >
            <SettingsIcon />
          </Link>
        </nav>
      </main>
    </div>
  );
}
