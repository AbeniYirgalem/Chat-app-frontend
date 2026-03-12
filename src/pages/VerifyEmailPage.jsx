import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { axiosInstance } from "../lib/axios";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { LoaderIcon, CheckCircleIcon, AlertTriangleIcon } from "lucide-react";

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    const verify = async () => {
      try {
        const res = await axiosInstance.get(
          `/auth/verify-email?token=${token}`,
        );
        setStatus("success");
        setMessage(res.data?.message || "Email verified successfully.");

        setTimeout(() => navigate("/login"), 2000);
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message || "Invalid or expired token.",
        );
      }
    };

    verify();
  }, [navigate, searchParams]);

  const renderIcon = () => {
    if (status === "success")
      return <CheckCircleIcon className="w-12 h-12 text-emerald-400" />;
    if (status === "error")
      return <AlertTriangleIcon className="w-12 h-12 text-amber-400" />;
    return <LoaderIcon className="w-12 h-12 text-cyan-400 animate-spin" />;
  };

  return (
    <div className="w-full flex items-center justify-center p-4 bg-slate-900 min-h-screen">
      <div className="relative w-full max-w-3xl h-[420px]">
        <BorderAnimatedContainer>
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="mb-6">{renderIcon()}</div>
            <h1 className="text-2xl font-semibold text-slate-100 mb-2">
              Email Verification
            </h1>
            <p className="text-slate-300 max-w-xl mb-6">{message}</p>

            {status === "success" && (
              <p className="text-sm text-slate-400">Redirecting to login...</p>
            )}

            {status === "error" && (
              <Link
                to="/login"
                className="auth-btn inline-flex items-center justify-center"
              >
                Go to Login
              </Link>
            )}
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
