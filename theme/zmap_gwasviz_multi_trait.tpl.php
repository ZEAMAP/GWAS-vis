<div class="gwas-content">
  <p>Compare GWAS locus for <b>multiple traits</b> within given region. If not specified, the most significant region of all selected traits was displayed. The traits were limited to <b>five</b> for better displaying. The scatter plot region can be easily changed by input a new region and 'SEARCH' or click on a BIN in the navigational Manhattan Plot panel. You could also search the GWAS data through our <a href="/table/gwas">GWAS Table browser</a>. &nbsp;&nbsp;&nbsp;&nbsp;<a id="view-more" href="javascript:">View More >>></a></p>
  <div id="view-more-info">
    <p><b>Navigational Manhattan Plot</b></p>
    <p>This panel shows the most significant P-value (Y-axis) of all selected traits and the genetic variants within 500Kb sliding window of the genome (X-axis). You can navigate to your interested region by zoom and drag. Click on the region will generat a gray vertical indicator, and draw 'Detailed Scatter Plot' of this region below.</p>
    <p><b>Detailed Scatter Plot</b></p>
    <p>This panel shows the detailed plot of the variants and the genes within a certain region. Currently, only variants with -Log10(P-value) greater than 5 were displayed. The dots were <b>colored by traits</b>. The gene information tooltip provides interfaces for connecting with the gene detailed information, genome browser and eQTL signals.</p>
  </div>
  <p id="messageBox"></p>
  <div class="gwasFilter">
    <div class="fuzzySearch">
      Trait: <input id="fuzzySearch" type="text" placeholder="eg. cobcolor" />
      <div id="zmap-gwas-phenotype-tree" class="ztree"></div>
    </div>
    <div class="gwasRegion">Region: <input id="gwasRegion" type="text" placeholder="eg. 6:108000000-108500000" /></div>
    <div class="gwasSearch"><input id="gwasSearch" class="btn-primary" type="button" value="Search" /></div> 
  </div>
  <div id="selected_nodes"><b>Selected Traits: </b></div>
  <div id="echart-gwas"></div>
  <div class="container">
    <div class="row">
      <div class="ten columns">
          <div id="lz-plot" data-region="6:108000000-108500000"></div>
      </div>
    </div>
  </div>
</div>
