import { Link, Form, redirect, useActionData, useNavigation } from "react-router";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/Card";
import { setToken, getToken } from "../utils/auth";
import { useEffect } from "react";
import { toast } from "sonner";
import { api } from "../utils/api";
import type { Route } from "./+types/register";

export function meta() {
  return [
    { title: "music plataform | register" },
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
  if (formData.get("password") != formData.get("confirmPassword")) {
    return { error: "As senhas não são iguais" }
  }

  try {
    const response = await api.post("/auth/register", formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.token) {
      setToken(response.data.token);
      return { success: true };
    }
  } catch (err: any) {
    return { error: err.response?.data?.message || "Erro de conexão com o servidor" };
  }
  return null;
}

export default function Register() {
  const actionData = useActionData<typeof clientAction>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error, {
        description: "Verifique os dados informados e tente novamente."
      });
    } else if (actionData?.success) {
      toast.success("Cadastro efetuado com sucesso!", {
        description: "Redirecionando para o painel..."
      });
      window.location.href = "/dashboard";
    }
  }, [actionData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans">
      <Card className="w-full max-w-md border-0 sm:border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl text-center">Criar conta</CardTitle>
          <CardDescription className="text-center">
            Preencha os dados abaixo para se cadastrar na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <Input
              label="Nome completo"
              type="text"
              placeholder="Digite seu nome completo"
              required
              name="name"
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="Digite seu e-mail"
              required
              name="email"
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Digite sua senha"
              required
              name="password"
            />
            <Input
              label="Confirmação de senha"
              type="password"
              placeholder="Digite sua senha novamente"
              required
              name="confirmPassword"
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none">Tipo de conta</label>
              <div className="flex gap-2 justify-start items-center">
                <div>
                  <input type="radio" name="role" id="listener" value="listener" defaultChecked />
                  <label htmlFor="listener">Ouvinte</label>
                </div>
                <div>
                  <input type="radio" name="role" id="artist" value="artist" />
                  <label htmlFor="artist">Artista</label>
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full text-gray-500">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-black font-semibold hover:underline">
              Fazer login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}