import { useState } from 'react'
import { Activity, Stethoscope } from 'lucide-react'
import { cores } from '../theme'
import { SINTOMAS } from '../data/checkinOpcoes'
import { avaliarImc, formatarImc } from '../lib/imc'
import Pagina, { Destaque } from '../components/Pagina'
import Bloco from '../components/Bloco'
import Botao from '../components/Botao'
import Indicador from '../components/Indicador'
import AvisoEmergencia from '../components/AvisoEmergencia'

// Vitrine do design system (rota /previa, só no ambiente local): paleta, tipografia e
// os componentes principais com valores ilustrativos, para aprovar o visual antes das telas reais.
export default function PreviaVisual() {
  const [marcados, setMarcados] = useState(['palpitacoes'])
  const [alcool, setAlcool] = useState(null)
  const imc = avaliarImc(92, 171.7, 48)
  const grave = marcados.some((v) => SINTOMAS.find((s) => s.valor === v)?.grave)

  const alternar = (valor) => setMarcados((m) => (m.includes(valor) ? m.filter((v) => v !== valor) : [...m, valor]))

  return (
    <div className="min-h-screen pb-10">
      <Pagina
        largura="max-w-4xl"
        sobretitulo="LOF Heart · Prévia visual"
        titulo={
          <>
            Paleta e <Destaque>componentes</Destaque>
          </>
        }
        descricao="Valores ilustrativos. Baseado nas três imagens de referência: o pôster vermelho, o coração translúcido e o coração em linhas sobre fundo escuro."
      >
        <Bloco titulo="Paleta (src/theme.js)">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(cores).map(([nome, hex]) => (
              <div key={nome} className="overflow-hidden rounded-xl border border-borda">
                <div className="h-14" style={{ background: hex }} />
                <p className="px-3 py-2 font-interface text-xs">
                  <strong>{nome}</strong>
                  <br />
                  <span className="text-textoSecundario">{hex}</span>
                </p>
              </div>
            ))}
          </div>
        </Bloco>

        <Bloco titulo="Tipografia">
          <div>
            <p className="font-interface text-[11px] font-semibold uppercase tracking-[0.2em] text-carmim">Rótulo · Montserrat</p>
            <h2 className="mt-1 text-3xl font-semibold">Título em Montserrat</h2>
            <p className="mt-2 max-w-xl leading-relaxed">
              Texto corrido em Source Sans 3, pensado para leitura confortável no celular, inclusive por pacientes mais velhos.
            </p>
          </div>
        </Bloco>

        <Bloco titulo="Visão profissional — indicadores" icone={<Stethoscope size={15} />}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Indicador rotulo="Última pressão" valor="128/82" unidade="mmHg" detalhe="Hoje, 08:10 · em repouso" />
            <Indicador
              rotulo="IMC calculado"
              valor={formatarImc(imc.valor)}
              detalhe={imc.classificacao}
              atencao="IMC na faixa de obesidade — medida de triagem"
            />
            <Indicador rotulo="Sono médio" valor="6,7" unidade="h" detalhe="Por noite, últimos 30 dias" />
            <Indicador rotulo="Estresse médio" valor="5,4" unidade="/10" detalhe="Declarado no período" />
          </div>
        </Bloco>

        <Bloco titulo="Check-in do paciente" icone={<Activity size={15} />}>
          <fieldset>
            <legend className="font-interface text-sm font-semibold">Você consumiu bebida alcoólica hoje?</legend>
            <div className="mt-3 flex gap-2">
              {['Sim', 'Não'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAlcool(r)}
                  aria-pressed={alcool === r}
                  className={`flex-1 rounded-full border px-4 py-2.5 font-interface text-sm font-semibold transition-colors ${
                    alcool === r ? 'border-carmim bg-carmim text-branco' : 'border-borda bg-branco text-texto hover:border-rosado'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-interface text-sm font-semibold">Sentiu algum destes sintomas?</legend>
            <p className="mt-1 text-xs text-textoSecundario">Experimente marcar “Dor ou desconforto no peito”.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SINTOMAS.map((s) => {
                const ativo = marcados.includes(s.valor)
                return (
                  <button
                    key={s.valor}
                    type="button"
                    onClick={() => alternar(s.valor)}
                    aria-pressed={ativo}
                    className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                      ativo ? 'border-carmim bg-blush font-semibold text-carmimEscuro' : 'border-borda bg-branco hover:border-rosado'
                    }`}
                  >
                    {s.rotulo}
                  </button>
                )
              })}
            </div>
          </fieldset>

          {grave && <AvisoEmergencia destaque />}

          <div className="flex flex-wrap gap-3">
            <Botao>Salvar check-in</Botao>
            <Botao variante="secundario">Ver histórico</Botao>
            <Botao variante="discreto">Pular por hoje</Botao>
          </div>
        </Bloco>

        <div className="rounded-3xl bg-noite p-6 text-branco">
          <p className="font-interface text-[11px] font-semibold uppercase tracking-[0.2em] text-rosado">Sobre fundo escuro</p>
          <p className="mt-2 text-2xl font-semibold">
            Seu coração, <Destaque>entre as consultas</Destaque>
          </p>
          <p className="mt-2 text-branco/70">
            Segunda série dos gráficos em <span className="font-semibold text-ardosia">ardósia</span>, ao lado do carmim.
          </p>
        </div>
      </Pagina>
    </div>
  )
}
