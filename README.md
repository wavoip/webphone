# Wavoip Webphone

Essa biblioteca foi feita com o intuito de facilitar a realização de ligações por dispositivos da Wavoip. Ela disponibiliza uma interface customizável e isolada do projeto onde está instalada. Esse webphone usa o [Wavoip API](https://github.com/wavoip/wavoip-api) por debaixo dos panos.

[Documentação disponível aqui](https://wavoip.gitbook.io/api/webphone)

# Alterando as cores do Webphone
As cores do webphone podem ser alteradas manualmente.


O arquivo a ser editado para customização das cores está em src/assets/index.css.
<img width="452" height="258" alt="image" src="https://github.com/user-attachments/assets/16012193-65ed-44e7-9fd0-102cb0008403" />    
Variáveis separadas para tema claro e escuro.


Cada variável altera uma série de componentes, como a variável “--background” que altera o plano de fundo de todo o webphone e “--foreground” que altera a cor do texto em cima deste fundo.
