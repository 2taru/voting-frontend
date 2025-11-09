import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { makeRequest } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";

export function RegisterPage({ className, ...props }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await makeRequest(
      "POST",
      "/register",
      {
        name,
        email,
        national_id: nationalId,
        password,
        password_confirmation: passwordConfirmation,
      },
      (res) => {
        setLoading(false);
        if (res.access_token) {
          localStorage.setItem("auth_token", res.access_token);
          toast.success("Вітаємо в системі!", { position: "top-center" });
          navigate("/");
        } else {
          toast.error(res.message || "Помилка реєстрації");
        }
      }
    );
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center px-4", className)} {...props}>
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Реєстрація</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Ім'я</Label>
                  <Input id="name" type="text" placeholder="Ваше ім'я" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="national_id">ІПН / Номер паспорта</Label>
                  <Input id="national_id" required value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
                </div>

                <div className="grid gap-3 relative">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-2 flex items-center justify-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password_confirmation">Підтвердження пароля</Label>
                  <Input id="password_confirmation" type="password" required value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      Завантаження <Spinner />
                    </>
                  ) : (
                    "Зареєструватися"
                  )}
                </Button>
              </div>

              <div className="mt-4 text-center text-sm">
                Вже маєте аккаунт?{" "}
                <Link to="/login" className="underline underline-offset-4">
                  Увійти
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
