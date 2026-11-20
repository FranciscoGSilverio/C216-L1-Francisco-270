# Instruções para agentes de programação

Este projeto usa agentes de programação como apoio à escrita de código, sob
curadoria do desenvolvedor (Francisco). O processo abaixo vale para qualquer alteração.

## Processo

1. **Spec primeiro.** Toda alteração de código tem uma spec escrita antes, em `docs/specs/`.
2. **Aprovação do desenvolvedor.** A spec só vale depois de aprovada por ele, com
   nome e data na seção "Aprovação". Sem aprovação, nenhuma mudança é feita.
3. **Implementação conforme a spec.** O que está fora da spec não é implementado.
   Se surgir algo novo, a spec é atualizada e reaprovada.
4. **Revisão.** O desenvolvedor revisa o resultado de cada bloco antes de seguir.
5. **Verificação.** Testes e lint rodam e passam antes de qualquer commit.

## Regras de commit

- Conventional commits em português, com título curto e corpo breve.
- Commits pequenos e progressivos, um por unidade coerente de trabalho.
- Sem trailer de co-autoria nas mensagens. O uso de IA é declarado na documentação
  do projeto (README e `docs/uso-de-ia.md`), não nos commits.
- Nenhuma senha ou segredo literal no repositório.
