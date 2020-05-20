$(document).ready(function(){
    window.onresize = function(){
        var plot_width = $('#lz-plot').css('width');
        var plot_height = $('#lz-plot.association.panel rect').css('height');
        $('#echart-gwas canvas').css('width', plot_width);
        $('#echart-gwas canvas').css('height', plot_height);
    }
    // init view more click event
    $('#view-more').click(function(){
        $("#view-more-info").animate({
            display: 'block',
            height:'toggle'
        });
        return false;
    });

    var query_trait = getQueryVariable('trait') ? getQueryVariable('trait') : 'cobcolor';
	get_region = get_bestregion(query_trait);
    var query_chr = getQueryVariable('chrom') ? getQueryVariable('chrom') : get_region.substr(0, get_region.indexOf(':'));
    var query_chr_start = getQueryVariable('start') ? getQueryVariable('start') : get_region.substr(get_region.indexOf(':')+1, get_region.indexOf('-'));
    var query_chr_end = getQueryVariable('end') ? getQueryVariable('end') : get_region.substr(get_region.indexOf('-')+1);
	var query_region = query_chr + ':' + query_chr_start + '-' + query_chr_end;

    /* --- gwasviz echart start --- */
    var api_prefix_echart_gwasviz = '/api/gwasviz/retrive_echart';
    var api_echart_gwasviz = api_prefix_echart_gwasviz + '/trait/' + query_trait;
    var echart_main_title = 'Navigational Manhattan Plot';
    var echart_sub_title = ' ( Trait: ' + query_trait + ' )';
    var echart_gwas_mark_area_xAxis0 = query_region;
    var echart_gwas_mark_area_xAxis1 = query_region;
    var echart_gwas;
    var echart_option;
    gwasviz_echart_init();
    /* --- gwasviz echart end --- */

    /* --- ztree zmap-gwas-phenotype-tree init start --- */
    var setting = {
            check: {
                enable: true,
                chkStyle: "radio",
		        radioType: "all"
            },
            view: {
                nameIsHTML: true, //允许name支持html				
                selectedMulti: false
            },
            edit: {
                enable: false,
                editNameSelectAll: false
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            treeNode: {
                open: false
            },
            callback: {
                onCheck: zTreeOnCheck
            }
        };
    var zNodes, zTreeObj;
    $.ajax({
        url: "/api/gwasviz/retrive_trait_category/single_trait",
        type: "get",
        dataType: "json",
        success: function(data){
            zNodes = data;
            zTreeObj = $.fn.zTree.init($("#zmap-gwas-phenotype-tree"), setting, zNodes);
            fuzzySearch('zmap-gwas-phenotype-tree','#fuzzySearch',null,true); //初始化模糊搜索方法
        }
    });
    $('#fuzzySearch').click(function(e){
        $('#zmap-gwas-phenotype-tree').show();
        e.stopPropagation();
    });
    $('#zmap-gwas-phenotype-tree').click(function(e){
        $('#zmap-gwas-phenotype-tree').show();
        e.stopPropagation();
    });
    $('body').on('click',function(){
        $('#zmap-gwas-phenotype-tree').hide();
    })
    
    $('#gwasSearch').click(function(){
        var treeObj = $.fn.zTree.getZTreeObj("zmap-gwas-phenotype-tree");
        var checkedNodes = treeObj.getCheckedNodes(true);
        var regionValue = $('#gwasRegion').val();
        if (checkedNodes.length == 0){
            $('#messageBox').html('At least select one trait.');
            $('#fuzzySearch').css('border-color', 'red');
            return false;
        }
        if(checkedNodes[0].oldname){
            selected_trait = checkedNodes[0].oldname;
        } else {
            selected_trait = checkedNodes[0].name;
        }
        if (regionValue.trim().length == 0){
			regionValue = get_bestregion(selected_trait);
        } else {
            var regex = /^[1-9]+\:[0-9]+\-[0-9]+/gi;
            if (!regex.test(regionValue)){
                $('#messageBox').html('Incorrect input format of Region.'); 
                $('#gwasRegion').css('border-color', 'red');
                return false;
            }
        }
        
        var chr_maxLength = [307041717, 244442276, 235667834, 246994605, 223902240, 174033170, 182381542, 181122637, 159769782, 150982314];     //每条染色体的最大长度  
        regionValue = regionValue.replace(':', '-');
        regionValue = regionValue.split('-');
        var selected_chr = parseInt(regionValue[0]);      //获取输入region的chr值
        var selected_chr_start = parseInt(regionValue[1]);      //获取输入region的起始坐标
        var selected_chr_end = parseInt(regionValue[2]);      //获取输入region的结束坐标
        //因为坐标轴按500k等分，计算输入的坐标落在哪个区间
        var nearest_left_area = Math.floor(selected_chr_start/5e5)*5e5;       
        var nearest_right_area = Math.ceil(selected_chr_end/5e5)*5e5

        if(selected_chr_start >= chr_maxLength[selected_chr-1] || selected_chr_end <= selected_chr_start){
            $('#messageBox').html('Incorrect input of Region.'); 
            $('#gwasRegion').css('border-color', 'red');
            return false;
        }
        if(nearest_right_area > chr_maxLength[selected_chr-1]){
            nearest_right_area = chr_maxLength[selected_chr-1];
        }

        $('#messageBox').html(''); 
        $('#gwasRegion').css('border-color', '#D1D1D1');
        $('#fuzzySearch').css('border-color', '#D1D1D1');
        //rerender echart highlight bar
        echart_gwas_mark_area_xAxis0 = regionValue[0] + ':' + nearest_left_area + '-' + (nearest_left_area+5e5);
        echart_gwas_mark_area_xAxis1 = regionValue[0] + ':' + (nearest_right_area-5e5) + '-' + nearest_right_area;
        api_echart_gwasviz = api_prefix_echart_gwasviz + '/trait/' + selected_trait;
        echart_sub_title = ' ( Trait: ' + selected_trait + ' )';
        gwasviz_echart_init();

        //rerender locus plot
        var selected_state = {trait: selected_trait, chr: selected_chr, start: selected_chr_start, end: selected_chr_end};
        plot.applyState(selected_state);
    });
    /* --- ztree zmap-gwas-phenotype-tree init end --- */

    /* --- gwasviz locus scatter init start --- */
    
    var data_sources;

    zmap_gwasviz_api = "/api/gwasviz";
    zmap_gwasviz_single_trait_api = "/api/gwasviz/single_trait";
    data_sources = new LocusZoom.DataSources()
        .add("assoc", ["AssociationLZ", {url: zmap_gwasviz_api + "/retrive_assoc", params: {source: 45, id_field: "variant"}}])
        .add("ld", ["LDLZ2", {url: zmap_gwasviz_single_trait_api + "/ld"}])
        .add("gene", ["GeneLZ", {url: zmap_gwasviz_api + "/retrive_gene"}]);

    // Get the standard association plot layout from LocusZoom's built-in layouts
	/*
    var stateUrlMapping = {trait: "trait", chr: "chrom", start: "start", end: "end"};
    // Fetch initial position from the URL, or use some defaults
    var initialState = LocusZoom.ext.DynamicUrls.paramsFromUrl(stateUrlMapping);
	var g_keys = Object.keys(initialState);
    if (!Object.keys(initialState).length) {
        //initialState = {chr: 10, start: 114550452, end: 115067678};
        initialState = {trait: 'cobcolor', chr: 1, start: 48000000, end: 48500000};
    }
	*/
	
	initialState = {trait: query_trait, chr: query_chr, start: query_chr_start, end: query_chr_end};
    layout = LocusZoom.Layouts.get("plot", "standard_association", {state: initialState});
    layout.dashboard = LocusZoom.Layouts.get("dashboard", "region_nav_plot");

    // Generate the LocusZoom plot, and reflect the initial plot state in url
    window.plot = LocusZoom.populate("#lz-plot", data_sources, layout);

    // Changes in the plot can be reflected in the URL, and vice versa (eg browser back button can go back to
    //   a previously viewed region)
    LocusZoom.ext.DynamicUrls.plotUpdatesUrl(plot, stateUrlMapping);
    LocusZoom.ext.DynamicUrls.plotWatchesUrl(plot, stateUrlMapping);

    // Add a basic loader to each panel (one that shows when data is requested and hides when one rendering)
    plot.layout.panels.forEach(function(panel){
        plot.panels[panel.id].addBasicLoader();
    });

    /* --- gwasviz locus scatter init end --- */

    /* --- customize function start --- */
    function zTreeOnCheck(event, treeId, treeNode)
    {
        if(treeNode.oldname){
            $('#fuzzySearch').val(treeNode.oldname);
        } else {
            $('#fuzzySearch').val(treeNode.name);
        }
    }

    function getQueryVariable(variable)
    {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
                var pair = vars[i].split("=");
                if(pair[0] == variable){return pair[1];}
        }
        return(false);
    }

    function gwasviz_echart_init()
    {
        echart_gwas = echarts.init(document.getElementById('echart-gwas'));
        $.ajax({
            url: api_echart_gwasviz,
            type: "get",
            dataType: "json",
            success: function(data){
                echart_option = {
                    grid: {
                        
                    },
                    title: {
                        text: echart_main_title + echart_sub_title
                    },
                    dataZoom: [{
                        type: 'inside'
                    }, {
                        type: 'slider'
                    }],
                    tooltip: {
                        trigger: 'axis',
                        padding: 10,
                        backgroundColor: '#222',
                        borderColor: '#777',
                        formatter: function(datas) 
                        {
                            var res = 'Region: ' + datas[0].data[0] + '<br/>';
                            res += '-log10 p-value: ' + datas[0].data[1] + '<br/>';
                            return res;
                        }
                    },
                    toolbox: {
                        feature: {
                            dataZoom: {
                                yAxisIndex: false,
                                title: {
                                    zoom: 'region zoom',
                                    back: 'restore zoom'
                                }
                            },
                            saveAsImage: {
                                pixelRatio: 2,
                                title: 'Save as PNG'
                            }
                        },
                        right: 40
            
                    },
                    xAxis: {
                        type: 'category',
                        name: 'BIN(Mb)',
                        nameGap: 16,
                        nameTextStyle: {
                            fontSize: 10
                        },
                        max: 4216,
                        splitLine: {
                            show: false
                        },
                        axisLabel: {
                            formatter: function (value, index){
                                value = value.replace(':', '-');
                                value = value.split('-');
                                var _start = parseInt(value[1])/1e6;
                                var _end = parseInt(value[2])/1e6;
                                return value[0]+':'+_start+'-'+_end; 
                            }
                        },
                    },
                    yAxis: {
                        type: 'value',
                        name: '-log10 p-value',
                        nameLocation: 'end',
                        splitLine: {
                            show: false
                        }
                    },
                    visualMap: [
                        {
                            dimension: 2,
                            top:'middle',
                            itemWidth: 16,
                            itemHeight:10,
                            itemGap:4,
                            categories:['chr1','chr2','chr3','chr4','chr5','chr6','chr7','chr8','chr9','chr10'],
                            color: ["#A6CEE3","#1F78B4","#B2DF8A","#33A02C","#FB9A99","#E31A1C","#FDBF6F","#FF7F00","#CAB2D6","#6A3D9A"],
                        },
                    ],
                    series: [{
                        name: 'GWAS-Bin',
                        type: 'bar',
                        data: data.echartData,
                        barCategoryGap: '0.5%',
                        markLine: {
                            symbol:'none',
                            silent: true,
                            data: [{
                                yAxis: 7.126089
                            }],
                            lineStyle: {
                                color: '#000'
                            },
                            label: {
                                formatter: "1/N: {c}"
                            }
                        },
                        markArea: {
                            itemStyle:{
                                color:"#BABABA",
                                borderColor: "#BABABA",
                                borderWidth: 2
                            },
                            data: [[{
                            xAxis: echart_gwas_mark_area_xAxis0
                            }, {
                            xAxis: echart_gwas_mark_area_xAxis1
                            }]]
                    },
                    }]
                };
                echart_gwas.setOption(echart_option);
                echart_gwas.on('click', function(params){
                    echart_option.series[0].data.forEach((d, i) => {
                        if (i === params.dataIndex) {
                            if (!d.isChecked) {
                                echart_option.series[0].markArea.data[0][0].xAxis = d[0];
                                echart_option.series[0].markArea.data[0][1].xAxis = d[0];
                                d.isChecked = true;
                            }
                        }
                    })
                    echart_gwas.setOption(echart_option);
                    var itemRegion = params.data[0];
                    itemRegion = itemRegion.replace(':', '-');
                    itemRegion = itemRegion.split('-');
                    var itemChr = itemRegion[0] ? itemRegion[0] : 1;
                    var itemStart = itemRegion[1] ? itemRegion[1] : 48000000;
                    var itemEnd = itemRegion[2] ? itemRegion[2] : 48500000;
                    var state = {trait: data.trait, chr: itemChr, start: itemStart, end: itemEnd};
                    //rerender locuszoom plot
                    plot.applyState(state);
                });
            }
        });
    }
    
	function get_bestregion(trait)
	{
		var bestRegion;
		$.ajax({
			url: "/api/gwasviz/single_trait/best_region/trait/" + trait,
			type: "get",
			async: false,
			dataType: "json",
			success: function(data){
				bestRegion = data.best_region;
			}
		});
		return bestRegion;
	}
	/* --- customize function end --- */
});
