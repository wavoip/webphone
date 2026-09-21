# Wavoip Webphone

Essa biblioteca foi feita com o intuito de facilitar a realização de ligações por dispositivos da Wavoip. Ela disponibiliza uma interface customizável e isolada do projeto onde está instalada. Esse webphone usa o [Wavoip API](https://github.com/wavoip/wavoip-api) por debaixo dos panos.

[Documentação disponível aqui](https://wavoip.gitbook.io/api/webphone)

# Alterando as cores do Webphone

As cores só mudam clonando este repositório e editando `src/assets/index.css`: elas são compiladas dentro do bundle, e o pacote publicado não as expõe. O passo a passo e a lista das variáveis estão em [Cores e tema](docs/customizacao/cores.md).
