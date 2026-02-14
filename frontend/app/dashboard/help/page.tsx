import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageCircle, Mail, HelpCircle, BookOpen, Video, ExternalLink } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Central de Ajuda</h1>
        <p className="text-muted-foreground">Tire suas dúvidas e encontre suporte</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">WhatsApp</CardTitle>
                <CardDescription>Atendimento rápido via chat</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Fale diretamente com nossa equipe de suporte pelo WhatsApp.
            </p>
            <Button variant="outline" className="w-full">
              <MessageCircle className="mr-2 h-4 w-4" />
              Iniciar Conversa
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">E-mail</CardTitle>
                <CardDescription>Suporte por e-mail</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Envie sua dúvida para suporte@reserva.online
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href="mailto:suporte@reserva.online">
                <Mail className="mr-2 h-4 w-4" />
                Enviar E-mail
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
          <CardDescription>Respostas para as dúvidas mais comuns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              Como funciona o sistema de sinais?
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              O cliente paga 30% do valor total como sinal para garantir a reserva. 
              O restante é acertado diretamente com você no dia do serviço.
            </p>
          </div>

          <div>
            <h3 className="font-medium flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              Como configurar o Mercado Pago?
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Acesse Configurações e insira seu Access Token do Mercado Pago. 
              Você encontra em: Mercado Pago → Desenvolvedores → Credenciais.
            </p>
          </div>

          <div>
            <h3 className="font-medium flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              Posso usar sem o Mercado Pago?
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sim! Configure sua chave PIX nas Configurações. O cliente receberá 
              a chave para fazer a transferência manualmente.
            </p>
          </div>

          <div>
            <h3 className="font-medium flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              Como compartilhar minha página de reservas?
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sua página está disponível em reserva.online/[seu-slug]. 
              Compartilhe esse link nas redes sociais, WhatsApp ou no seu site.
            </p>
          </div>

          <div>
            <h3 className="font-medium flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              Como funciona a cobrança por hora?
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Ao criar um recurso, selecione "Por Hora" e defina a duração de cada 
              horário. Os clientes poderão escolher horários disponíveis.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recursos</CardTitle>
          <CardDescription>Materiais para te ajudar a aproveitar ao máximo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="#">
                <BookOpen className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Guia de Início Rápido</p>
                  <p className="text-xs text-muted-foreground">Configure em 5 minutos</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="#">
                <Video className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Tutoriais em Vídeo</p>
                  <p className="text-xs text-muted-foreground">Aprenda passo a passo</p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
