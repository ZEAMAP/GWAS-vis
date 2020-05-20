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

    var query_trait = getQueryVariable('trait') ? getQueryVariable('trait') : 'C16_0,C18_0,C20_0,C22_0,C24_0';
    var query_chr = getQueryVariable('chr') ? getQueryVariable('chr') : 1;
    var query_start = getQueryVariable('start') ? getQueryVariable('start') : '48300000';
    var query_end = getQueryVariable('end') ? getQueryVariable('end') : '48700000';

    /* --- gwasviz echart start --- */
    var api_prefix_echart_gwasviz = '/api/gwasviz/retrive_echart';
    var api_echart_gwasviz = api_prefix_echart_gwasviz + '/trait/' + query_trait;
    var echart_main_title = 'Navigational Manhattan Plot';
    var echart_gwas_mark_area_xAxis0 = '6:108000000-108500000';
    var echart_gwas_mark_area_xAxis1 = '6:108000000-108500000';
    var echart_gwas;
    var echart_option;
    gwasviz_echart_init();
    /* --- gwasviz echart end --- */

    /* --- ztree zmap-gwas-phenotype-tree init start --- */
    var setting = {
            check: {
                enable: true,
                chkStyle: "checkbox"
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
    var zNodes, zTreeObj, trait_cat;
    var zTree_selected_nodes = new Array();
    $.ajax({
        url: "/api/gwasviz/retrive_trait_category/multi_trait",
        type: "get",
        dataType: "json",
        success: function(data){
            trait_cat = zNodes = data;
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
        var selectedNodes = new Array();
        $.each(zTree_selected_nodes, function(index, item){
            if(item) {
                selectedNodes.push(item);
            }
        });
        var regionValue = $('#gwasRegion').val();
        if (selectedNodes.length == 0){
            $('#messageBox').html('At least select one trait.');
            $('#fuzzySearch').css('border-color', 'red');
            return false;
        }
        if(selectedNodes.length > 5){
            $('#messageBox').html('Limit up to 5 traits.');
            $('#fuzzySearch').css('border-color', 'red');
            return false;
        }
        var selected_trait = '';
        $.each(selectedNodes, function(index, item){
            selected_trait += item + ',';
        });
        selected_trait = selected_trait.substring(0, selected_trait.lastIndexOf(','));
        if (regionValue.trim().length == 0){
            $.ajax({
                url: "/api/gwasviz/single_trait/best_region/trait/" + selected_trait,
                type: "get",
                async: false,
                dataType: "json",
                success: function(data){
                    regionValue = data.best_region;
                }
            });
        } else {
            var regex = /^[1-9]+\:[0-9]+\-[0-9]+/gi;
            if (!regex.test(regionValue)){
                $('#messageBox').html('Incorrect input format of Region.'); 
                $('#gwasRegion').css('border-color', 'red');
                return false;
            }
        }
        
        var chr_maxPosition = [307041717, 244442276, 235667834, 246994605, 223902240, 174033170, 182381542, 181122637, 159769782, 150982314];     //每条染色体的最大长度坐标  
        regionValue = regionValue.replace(':', '-');
        regionValue = regionValue.split('-');
        var selected_chr = parseInt(regionValue[0]);      //获取输入region的chr值
        var selected_chr_start = parseInt(regionValue[1]);      //获取输入region的起始坐标
        var selected_chr_end = parseInt(regionValue[2]);      //获取输入region的结束坐标
        //因为坐标轴按500k等分，计算输入的坐标落在哪个区间
        var nearest_left_area = Math.floor(selected_chr_start/5e5)*5e5;       
        var nearest_right_area = Math.ceil(selected_chr_end/5e5)*5e5

        if(selected_chr_start >= chr_maxPosition[selected_chr-1] || selected_chr_end <= selected_chr_start){
            $('#messageBox').html('Incorrect input of Region.'); 
            $('#gwasRegion').css('border-color', 'red');
            return false;
        }
        if(nearest_right_area > chr_maxPosition[selected_chr-1]){
            nearest_right_area = chr_maxPosition[selected_chr-1];
        }

        $('#messageBox').html(''); 
        $('#gwasRegion').css('border-color', '#D1D1D1');
        $('#fuzzySearch').css('border-color', '#D1D1D1');
        //rerender echart highlight bar
        echart_gwas_mark_area_xAxis0 = regionValue[0] + ':' + nearest_left_area + '-' + (nearest_left_area+5e5);
        echart_gwas_mark_area_xAxis1 = regionValue[0] + ':' + (nearest_right_area-5e5) + '-' + nearest_right_area;
        api_echart_gwasviz = api_prefix_echart_gwasviz + '/trait/' + selected_trait + '/chr/' + selected_chr + '/start/' + selected_chr_start + '/end/' + selected_chr_end;
        gwasviz_echart_init();

        //rerender locus plot
        var phenos = new Array();
        selected_trait = selected_trait.split(',');
        $.each(selected_trait, function(index, item){
            var pheno = { namespace: item, title: item, color: pheno_color[index], study_id: index+1 };
            phenos.push(pheno);
        });
        var data_region = selected_chr + ':' + selected_chr_start + '-' + selected_chr_end; 
        $('#lz-plot').attr('data-region', data_region);
        gwasviz_locus_scatter_init(selected_chr, selected_chr_start, selected_chr_end, phenos);
    });
    /* --- ztree zmap-gwas-phenotype-tree init end --- */

    /* --- gwasviz locus scatter init start --- */
    var init_chr = 6;
    var init_start = 108000000;
    var init_end = 108500000;
    pheno_color = ['#E41A1C', '#377EB8', '#4DAF4A', '#984EA3', '#FF7F00'];
    var init_phenos = [
        { namespace: "C16_0", title: "C16_0", color: pheno_color[0], study_id: 44 },
        { namespace: "C18_0", title: "C18_0", color: pheno_color[1], study_id: 50 },
        { namespace: "C20_0", title: "C20_0", color: pheno_color[2], study_id: 62 },
        { namespace: "C22_0", title: "C22_0", color: pheno_color[3], study_id: 68 },
        { namespace: "C24_0", title: "C24_0", color: pheno_color[4], study_id: 71 }
    ];
    var zmap_gwasviz_api = "/api/gwasviz";
    var zmap_gwasviz_multi_trait_api = "/api/gwasviz/multi_trait";

    gwasviz_locus_scatter_init(init_chr, init_start, init_end, init_phenos);

    /* --- gwasviz locus scatter init end --- */

    /* --- customize function start --- */
    function zTreeOnCheck(event, treeId, treeNode)
    {
        var treeObj = $.fn.zTree.getZTreeObj("zmap-gwas-phenotype-tree");
        var changedNodes = treeObj.getChangeCheckedNodes();
        $.each(changedNodes, function(index, item){
            item.checkedOld = item.checked;
        });
        $('#selected_nodes').css('display', 'block');
        var checkedNode = '';
        $.each(changedNodes, function(index, item){
            if (item.checked === true){
                if(item.level !== 0) {
                    if(item.oldname){
                        checkedNode = '<div id="'+ item.id +'" class="checked_node"><span>' + item.oldname + '</span></div>';
                        zTree_selected_nodes[parseInt(item.id)] = item.oldname; 
                    } else {
                        checkedNode = '<div id="'+ item.id +'" class="checked_node"><span>' + item.name + '</span></div>';
                        zTree_selected_nodes[parseInt(item.id)] = item.name;
                    }
                    $('#selected_nodes').append(checkedNode);
                }
            } else {
                if(item.level !== 0) {
                    remove_id = '#' + item.id;
                    $('div').remove(remove_id);
                    zTree_selected_nodes.splice(parseInt(item.id), 1, null);
                }
            }
        });
        if($('.checked_node').length == 0){
            $('#selected_nodes').css('display', 'none');
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
                        text: echart_main_title
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
                            var res = 'Trait: ' + datas[0].data[3] + '<br/>';
                            res += 'Region: ' + datas[0].data[0] + '<br/>';
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
                    console.log(params);
                    var itemRegion = params.data[0];
                    $('#lz-plot').attr('data-region', itemRegion);
                    itemRegion = itemRegion.replace(':', '-');
                    itemRegion = itemRegion.split('-');

                    var phenos = new Array();
                    selected_trait = data.trait.split(',');
                    $.each(selected_trait, function(index, item){
                        var pheno = { namespace: item, title: item, color: pheno_color[index], study_id: index+1 };
                        phenos.push(pheno);
                    });
                     
                    gwasviz_locus_scatter_init(itemRegion[0], itemRegion[1], itemRegion[2], phenos);
                });
            }
        });
    }

    function gwasviz_locus_scatter_init(chr, start, end, phenos)
    {
        var data_sources = new LocusZoom.DataSources().add("gene", ["GeneLZ", { url: zmap_gwasviz_api + "/retrive_gene/chr/" + chr + "/start/" + start + "/end/" + end}]);

        // Build the base layout
        var association_panel_mods = {
            data_layers: [
                LocusZoom.Layouts.get("data_layer", "significance", { name: "Line of GWAS Significance" }),
            ],
            dashboard: LocusZoom.Layouts.get("panel", "association")["dashboard"]
        };
        association_panel_mods.dashboard.components.push({
            type: "data_layers",
            position: "right",
            statuses: ["faded", "hidden"]
        });
        layout = {
            width: 800,
            height: 500,
            responsive_resize: 'both',
            panels: [
                LocusZoom.Layouts.get("panel", "association", association_panel_mods),
                LocusZoom.Layouts.get("panel", "genes", { namespace: { "gene": "gene" } })
            ],
            dashboard: LocusZoom.Layouts.get("dashboard","region_nav_plot")
        };

        // Define a set of studies/phenotypes and loop through them to add a data source and data layer for each one
        
        phenos.forEach(function(pheno){
            var assoc_url = zmap_gwasviz_api + "/retrive_assoc/trait/" + pheno.title + "/chr/" + chr + "/start/" + start + "/end/" + end;
            data_sources.add(pheno.namespace, ["AssociationLZ", {url: assoc_url, params: { source: pheno.study_id, id_field: "variant" }}]);
            var association_data_layer_mods = {
                namespace: { "assoc": pheno.namespace },
                id: "associationpvalues_" + pheno.namespace,
                name: pheno.title,
                point_shape: "circle",
                point_size: 40,
                color: pheno.color,
                legend: [
                    { shape: "circle", color: pheno.color, size: 40, label: pheno.title, class: "lz-data_layer-scatter" },
                ],
                fields: [pheno.namespace+":variant", pheno.namespace+":position", pheno.namespace+":log_pvalue", pheno.namespace+":log_pvalue|logtoscinotation", pheno.namespace+":ref_allele"],
                tooltip: {
                    closable: true,
                    show: { or: ["highlighted", "selected"] },
                    hide: { and: ["unhighlighted", "unselected"] },
                    html: "<strong>" + pheno.title + "</strong><br>"
                        + "<strong>{{" + pheno.namespace + ":variant}}</strong><br>"
                        + "P Value: <strong>{{" + pheno.namespace + ":log_pvalue|logtoscinotation}}</strong><br>"
                        + "Ref. Allele: <strong>{{" + pheno.namespace + ":ref_allele}}</strong><br>"
                }
            };
            layout.panels[0].data_layers.push(LocusZoom.Layouts.get("data_layer", "association_pvalues", association_data_layer_mods));
        });

        // Generate the LocusZoom plot
        var plot = LocusZoom.populate("#lz-plot", data_sources, layout);

        // Add a basic loader to each panel (one that shows when data is requested and hides when one rendering)
        plot.layout.panels.forEach(function(panel){
            plot.panels[panel.id].addBasicLoader();
        });
    }
    /* --- customize function end --- */
});
