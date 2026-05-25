import { Link, Form, redirect, useActionData, useNavigation } from "react-router";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/Card";
import { setToken, getToken } from "../utils/auth";
import { useEffect } from "react";
import { toast } from "sonner";
import { api } from "../utils/api";
import type { Route } from "./+types/login";

export function meta() {
  return [
    { title: "Login - Music Platform" },
  ];
}

export function clientLoader() {
  if (getToken()) {
    return redirect("/dashboard");
  }
  return null;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const response = await api.post("/auth/login", { email, password });

    if (response.data.token) {
      setToken(response.data.token);
      return { success: true };
    }
  } catch (err: any) {
    return { error: err.response?.data?.message || "Erro de conexão com o servidor" };
  }
  return null;
}

export default function Login() {
  const actionData = useActionData<typeof clientAction>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error, {
        description: "Verifique suas credenciais e tente novamente."
      });
    } else if (actionData?.success) {
      toast.success("Login efetuado com sucesso!", {
        description: "Redirecionando..."
      });
      // Redirect handled via client-side router or window.location
      window.location.href = "/dashboard";
    }
  }, [actionData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans">
      <Card className="w-full max-w-md border-0 sm:border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="exemplo@email.com"
              required
              name="email"
            />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none">Senha</label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-500 hover:text-black transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                required
                name="password"
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Não tem uma conta?{" "}
            <Link to="/register" className="text-black font-semibold hover:underline">
              Registre-se
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}