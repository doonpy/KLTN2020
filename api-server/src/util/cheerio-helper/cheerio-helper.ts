import cheerio from 'cheerio';

export interface ToolboxLocator {
    label: string;
    cssSelector: string;
}

export const addHighlight = (
    html: string,
    toolboxLocators: ToolboxLocator[]
): string | null => {
    const $ = cheerio.load(html);
    $('head').append(
        `<style>
                .pk-border {
                  border: 2px solid red !important;
                }
                
                /* Tooltip container */
                .pk-tooltip {
                  position: relative !important;
                  display: inline-block !important;
                }
                
                /* Tooltip text */
                .pk-tooltip .pk-tooltip-text {
                  display: inline-block !important;
                  text-transform: initial !important;
                  font-weight: bold !important;
                  visibility: hidden;
                  width: 100px !important;
                  background-color: gray !important;
                  color: #fff !important;
                  text-align: center !important;
                  padding: 5px 5px !important;
                  border-radius: 6px !important;
                  border: 2px solid black !important;
                 
                  /* Position the tooltip text - see examples below! */
                  position: absolute !important;
                  z-index: 1 !important;
                  bottom: 100% !important;
                  left: 50% !important;
                  margin-left: -60px !important;
                  opacity: 0;
                  transition: opacity 500ms;
                }
                
                .pk-tooltip .pk-tooltip-text::after {
                  content: " " !important;
                  position: absolute !important;
                  top: 100% !important; /* At the bottom of the tooltip */
                  left: 50% !important;
                  margin-left: -5px !important;
                  border-width: 5px !important;
                  border-style: solid !important;
                  border-color: black transparent transparent transparent !important;
                }
                
                .pk-tooltip:hover .pk-tooltip-text {
                  visibility: visible;
                  opacity: 1;
                }
            </style>`
    );

    $('a').each((index, element) => {
        $(element).attr('href', '#');
    });

    toolboxLocators.forEach(({ label, cssSelector }) => {
        $(cssSelector)
            .addClass('pk-tooltip pk-border')
            .append(`<span class="pk-tooltip-text">${label}</span>`);
    });

    return $.root().html();
};
