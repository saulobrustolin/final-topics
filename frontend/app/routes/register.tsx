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
    { title: "Cadastro - Music Platform" },
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

  try {
    const response = await api.post("/auth/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
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
          <CardTitle className="text-3xl text-center">Criar Conta</CardTitle>
          <CardDescription className="text-center">
            Preencha os dados abaixo para se cadastrar na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" encType="multipart/form-data" className="space-y-4">
            <Input
              label="Nome Completo"
              type="text"
              placeholder="Seu nome"
              required
              name="name"
            />
            <Input
              label="Email"
              type="email"
              placeholder="exemplo@email.com"
              required
              name="email"
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              required
              name="password"
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none">Tipo de Conta</label>
              <select 
                name="role" 
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                defaultValue="listener"
              >
                <option value="listener">Ouvinte</option>
                <option value="artist">Artista</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none">Foto de Perfil (Opcional)</label>
              <input
                type="file"
                name="profile_photo"
                accept="image/*"
                className="flex w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
              />
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