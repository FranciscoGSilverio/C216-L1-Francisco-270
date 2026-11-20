# Uso de agentes de programação neste projeto

Este projeto foi desenvolvido com o apoio de um agente de programação (Claude Code). O uso é
declarado aqui de forma aberta. Este documento descreve o processo e como verificá-lo.

## Processo

Nenhuma alteração de código foi feita sem uma especificação escrita e aprovada antes
(regra registrada em [`CLAUDE.md`](../CLAUDE.md)):

1. **Spec:** o agente redigia a especificação do bloco (problema, escopo, decisões e critérios de aceite).
2. **Aprovação:** o desenvolvedor lia, pedia ajustes e aprovava, com nome e data na própria spec.
3. **Implementação:** o agente escrevia código e testes conforme a spec, em commits pequenos.
4. **Revisão:** o desenvolvedor revisava o resultado do bloco antes de seguir, e aprovava ou pedia correções.
5. **Verificação:** testes, lint, build, E2E e a subida dos contêineres rodavam e precisavam passar.

## Specs

| Spec | Bloco |
|---|---|
| [01](specs/01-backend.md) | API, modelo de dados e regras de negócio |
| [02](specs/02-infraestrutura.md) | Docker, Compose, migrations automáticas e Makefile |
| [03](specs/03-frontend.md) | Interface, rotas, validação e elenco |
| [04](specs/04-qualidade-e-entrega.md) | E2E, CI, documentação e entrega |

## Quem fez o quê

- **Desenvolvedor:** escolha do tema e do domínio (inclusive o personagem no vínculo N:N), decisões de
  tecnologia e de interface, aprovação de cada spec, revisão de cada bloco, correções pedidas durante a
  revisão (por exemplo, rotas separadas por recurso, validação com Yup após o blur, modal de confirmação,
  asterisco nos campos obrigatórios), execução e verificação da aplicação e o vídeo demonstrativo.
- **Agente:** redação das specs, escrita do código e dos testes, execução dos comandos de verificação e
  relato de desvios e problemas encontrados.

## Como conferir

- O histórico do Git é progressivo e mostra, em ordem, cada spec seguida da sua implementação.
- Cada spec registra a aprovação e as observações do revisor, com data.
- Os commits não levam trailer de co-autoria; a divulgação está concentrada neste documento e no README.
