/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Catalogo from "@/components/Catalogo";
import Frete from "@/components/Frete";
import Vitrine from "@/components/Vitrine";
import IconeInstagram from "@/components/IconeInstagram";
import IconeWhatsApp from "@/components/IconeWhatsApp";
import Marca from "@/components/Marca";
import { PRODUTOS_EXEMPLO, type Produto } from "@/lib/produtos";
import { supabase, supabaseConfigurado } from "@/lib/supabase";
import { INSTAGRAM_ARROBA, INSTAGRAM_URL } from "@/lib/instagram";
import { linkWhatsApp, telefoneFormatado } from "@/lib/whatsapp";

// Atualiza o catálogo no máximo a cada 30 segundos
export const revalidate = 30;

async function carregarProdutos(): Promise<{ produtos: Produto[]; exemplo: boolean }> {
  if (!supabaseConfigurado) {
    return { produtos: PRODUTOS_EXEMPLO, exemplo: true };
  }

  const { data, error } = await supabase().from("produtos").select("*");

  if (error) {
    console.error("Erro ao carregar produtos:", error.message);
    return { produtos: [], exemplo: false };
  }

  return { produtos: (data ?? []).map((p) => ({ ...p, preco: Number(p.preco) })), exemplo: false };
}

export default async function Home() {
  const { produtos, exemplo } = await carregarProdutos();

  return (
    <>
      <header className="topo">
        <div className="wrap">
          <Marca />
          <nav className="links" aria-label="Seções">
            <a href="#produtos">Produtos</a>
            <a href="#encomenda">Sob encomenda</a>
            <a href="#frete">Frete</a>
            <a href="#como-funciona">Como funciona</a>
            <Link href="/admin" className="link-admin">Admin</Link>
          </nav>
          <a
            className="btn-insta"
            target="_blank"
            rel="noopener noreferrer"
            href={INSTAGRAM_URL}
            aria-label={`Instagram ${INSTAGRAM_ARROBA}`}
            title={INSTAGRAM_ARROBA}
          >
            <IconeInstagram tamanho={20} />
          </a>
          <a
            className="btn btn-vermelho btn-admin"
            target="_blank"
            rel="noopener noreferrer"
            href={linkWhatsApp("Olá! Vim pelo site da Innovation 3D.")}
            aria-label="WhatsApp"
          >
            <IconeWhatsApp />
            <span className="rotulo">WhatsApp</span>
          </a>
        </div>
      </header>

      <main id="inicio">
        <section className="hero">
          <div className="wrap">
            <div>
              <span className="selo">Impressão 3D sob medida</span>
              <h1>
                <em>Imaginou?</em>
                <br />A gente <strong>imprime.</strong>
              </h1>
              <p className="lead">
                Decoração para casa, peças personalizadas, festas, empresas, itens geek, organizadores e arte sacra,
                produzidos camada por camada com acabamento caprichado.
              </p>
              <div className="acoes">
                <a className="btn btn-azul" href="#produtos">Ver produtos</a>
                <a className="btn btn-linha" href="#encomenda">Fazer uma encomenda</a>
              </div>
              <div className="fatos">
                <div><b>0,12 mm</b>altura de camada no acabamento fino</div>
                <div><b>PLA · PETG · TPU</b>materiais rígidos e flexíveis</div>
              </div>
            </div>
            <div className="palco" aria-hidden="true">
              <img src="/logo.webp" alt="" />
              <div className="camadas" />
              <div className="bico" />
              <span className="legenda mono">imprimindo · camada 412/412</span>
            </div>
          </div>
        </section>

        <section className="bloco" id="produtos">
          <div className="wrap">
            <Catalogo produtos={produtos} exemplo={exemplo} />
          </div>
        </section>

        <section className="bloco" id="frete">
          <div className="wrap">
            <Frete />
          </div>
        </section>

        <section className="bloco" id="encomenda">
          <div className="wrap">
            <div className="encomenda">
              <div>
                <h2>
                  Tem uma ideia? <span>A gente cria.</span>
                </h2>
                <p>
                  Envie uma foto, um desenho ou só a ideia. Fazemos o orçamento, mostramos a prévia e
                  imprimimos na cor e no tamanho que você escolher.
                </p>
                <a
                  className="btn btn-vermelho"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={linkWhatsApp("Olá! Quero fazer uma encomenda personalizada.")}
                >
                  Pedir orçamento pelo WhatsApp
                </a>
              </div>
              <Vitrine produtos={produtos} />
            </div>
          </div>
        </section>

        <section className="bloco" id="como-funciona">
          <div className="wrap">
            <div className="cab">
              <div>
                <h2>Como funciona</h2>
                <p>Do pedido à sua casa em quatro passos.</p>
              </div>
            </div>
            <div className="passos">
              <div className="passo"><h3>Escolha</h3><p>Escolha um produto do catálogo ou conte sua ideia.</p></div>
              <div className="passo"><h3>Peça pelo WhatsApp</h3><p>Combinamos cor, tamanho, prazo e pagamento.</p></div>
              <div className="passo"><h3>Impressão</h3><p>Sua peça é impressa e recebe acabamento.</p></div>
              <div className="passo"><h3>Entrega</h3><p>Retirada combinada ou envio pelos Correios para todo o Brasil.</p></div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <Marca />
          <a
            className="badge-whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            href={linkWhatsApp("Olá! Vim pelo site da Innovation 3D.")}
            aria-label={`Falar no WhatsApp: ${telefoneFormatado()}`}
          >
            <IconeWhatsApp tamanho={22} />
            <span>
              <small>Fale no WhatsApp</small>
              {telefoneFormatado()}
            </span>
          </a>
          <a
            className="badge-instagram"
            target="_blank"
            rel="noopener noreferrer"
            href={INSTAGRAM_URL}
            aria-label={`Seguir no Instagram: ${INSTAGRAM_ARROBA}`}
          >
            <IconeInstagram tamanho={22} />
            <span>
              <small>Siga no Instagram</small>
              {INSTAGRAM_ARROBA}
            </span>
          </a>
          <span>
            © {new Date().getFullYear()} Innovation 3D ·{" "}
            <Link href="/admin" className="link-admin">
              Área do administrador
            </Link>
          </span>
        </div>
      </footer>
    </>
  );
}
