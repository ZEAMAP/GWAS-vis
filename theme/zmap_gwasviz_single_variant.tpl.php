<div id="plot-container">
    <div>
        <p>Browse all GWAS signals related to the given variant, scatters were colored by trait category. The whole genome position and detailed position of the given variant were indicated by the yellow and red vertical line in the chromesome track and the gene track, respectively.</p>
    </div>
    <div>
        <label for="input-variant">Variant: </label>
        <p id="error-variant" class="error" style="display: none">Invalid variant. Must be in chrom:pos_ref/alt format.</p>
        <input id="input-variant" type="text">
        <button id="button-jump" class="button-primary">Search</button>
        &nbsp;&nbsp;e.g chr6.s_108217003
    </div>
    <div id="lz-plot"></div>
</div>