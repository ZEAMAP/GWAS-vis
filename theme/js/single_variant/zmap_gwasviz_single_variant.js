$(document).ready(function(){
    var variantForPlot = Drupal.settings.zmap_gwasviz_single_variant.variant ? Drupal.settings.zmap_gwasviz_single_variant.variant : 'chr6.s_108217003';

    var VARIANT_PATTERN = /chr(\d+)\.s_(\d+)/;

    // Break the variant into constituent parts for setting plot state
    var variantGroups = VARIANT_PATTERN.exec(variantForPlot);
    var variantChrom = variantGroups[1];
    var variantPosition = +variantGroups[2];
    //var variantRefAlt = variantGroups[3];

    var chr_maxLength = [307041717, 244442276, 235667834, 246994605, 223902240, 174033170, 182381542, 181122637, 159769782, 150982314];     //每条染色体的最大长度
    // Genome base pairs static data
    var genome_data =  [
    { chr: 1, base_pairs: chr_maxLength[0] },
    { chr: 2, base_pairs: chr_maxLength[1] },
    { chr: 3, base_pairs: chr_maxLength[2] },
    { chr: 4, base_pairs: chr_maxLength[3] },
    { chr: 5, base_pairs: chr_maxLength[4] },
    { chr: 6, base_pairs: chr_maxLength[5] },
    { chr: 7, base_pairs: chr_maxLength[6] },
    { chr: 8, base_pairs: chr_maxLength[7] },
    { chr: 9, base_pairs: chr_maxLength[8] },
    { chr: 10, base_pairs: chr_maxLength[9] },
    ];


    var dataSources= new LocusZoom.DataSources();
    var api_gwasviz = "/api/gwasviz";
    var api_gwasviz_single_variant = "/api/gwasviz/single_variant";
    dataSources.add("phewas", ["PheWASLZ", {url: api_gwasviz_single_variant + "/retrive_phewas", params: { build: ["mays"] } }])
        .add("gene", ["GeneLZ", { url: api_gwasviz + "/retrive_gene" }])

    // Static blobs (independent of host)
    dataSources
    .add("variant", ["StaticJSON", [{ "x": variantPosition, "y": 0 }, { "x": variantPosition, "y": 1 }]])
    .add("genome", ["StaticJSON", genome_data]);

    // Define the layout
    var mods = {
    state: {
        variant: variantForPlot,
        start: variantPosition - 250000,
        end: variantPosition + 250000,
        chr: variantChrom
    }
    };
    var layout = LocusZoom.Layouts.get("plot", "standard_phewas", mods);
    layout.panels[0].margin.top = 32;
    layout.panels[1].height = 50;
    layout.panels[2].data_layers.push({
    id: "variant",
    type: "orthogonal_line",
    orientation: "vertical",
    offset: variantPosition,
    style: {
        "stroke": "#FF3333",
        "stroke-width": "2px",
        "stroke-dasharray": "4px 4px"
    }
    });

    // Modify the tooltips for PheWAS result data layer points to contain more data. The fields in this sample
    //   tooltip are specific to the LZ-Portal API, and are not guaranteed to be in other PheWAS datasources.
    var phewas_layer = layout.panels[0].data_layers[1];
    // Tell the layer to also fetch some special fields; otherwise the datasource will hide this info (TODO)
    phewas_layer.fields.push("phewas:pmid", "phewas:description", "phewas:study");
    phewas_layer.tooltip.html = [
        "<strong>Trait:</strong> {{phewas:trait_label|htmlescape}}<br>",
        "<strong>Trait Category:</strong> {{phewas:trait_group|htmlescape}}<br>",
        "<strong>P-value:</strong> {{phewas:log_pvalue|logtoscinotation|htmlescape}}<br>",
        /*
        "{{#if phewas:study}}",
        "<strong>Study:</strong> {{phewas:study|htmlescape}}<br>",
        "{{/if}}",
        "{{#if phewas:pmid}} {{#if phewas:description}}",
            '<strong>Description:</strong> <a target=_blank href="https://www.ncbi.nlm.nih.gov/pubmed/?term={{phewas:pmid}}">{{phewas:description|htmlescape}}</a>',
        "{{/if}} {{/if}}"
        */
    ].join("");

    // Generate the plot
    var plot = LocusZoom.populate("#lz-plot", dataSources, layout);
    plot.panels.phewas.setTitle("Variant " + variantForPlot);

    // Function to load new PheWAS data into the plot
    function loadPheWAS(variant_tag){
    var match = VARIANT_PATTERN.exec(variant_tag);

    var locus = +match[2];
    var state = {
        variant: variant_tag,
        start: (locus - 250000),
        end: (locus + 250000),
        chr: +match[1]
    };
    plot.panels.genes.data_layers.variant.layout.offset = locus;
    plot.panels.phewas.setTitle("Variant " + variant_tag);
    plot.clearPanelData(null, "reset");
    plot.applyState(state);
    }

    
    function showInvalidVariant() {
    document.getElementById("error-variant").style.display = "";
    }

    function hideInvalidVariant() {
    document.getElementById("error-variant").style.display = "none";
    }

    function checkVariant(variant) {
        var match = VARIANT_PATTERN.exec(variant);
        if (!match) {
            showInvalidVariant();
            return false;
        } else {
            return true;
        }
    }

    function jumpToVariant() {
        var input_variant = document.getElementById("input-variant");
        if (input_variant) {
          var jmp_variant = input_variant.value || input_variant.placeholder;

          if (checkVariant(jmp_variant)) {
            hideInvalidVariant();
            loadPheWAS(jmp_variant)
          }
        }
      }

      // Control to jump to any variant
      document.getElementById("button-jump").addEventListener("click", function(event) {
        jumpToVariant()
      });
      document.getElementById("input-variant").addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
          jumpToVariant()
        }
      });

      $("g[id='lz-plot.genome_legend.panel_container'] .lz-panel-background").css('height', '35px');
      $("g[id='lz-plot.genome_legend.x_axis']").css('transform', 'translate(50px,35px)');
});
