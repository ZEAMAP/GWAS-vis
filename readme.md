# Zmap GWAS Visualization module is designed for display GWAS heatmap and scatter.
## Installation
- 首先需要安装csvtk工具，下载地址参考：https://github.com/shenwei356/csvtk/releases/download/v0.17.0/csvtk_linux_amd64.tar.gz ,安装完毕后，将csvtk执行程序放在环境变量PATH中.
- 然后启用zmap_gwasviz模块，在Drupal public file directory(sites/default/files)中建立软连接，如下：
    - `zmap_gwasviz_74_trait_win500K.tsv` 链接到GWAS数据的 `gwasviz_74_trait_win500K.tsv` 文件
    - `zmap_gwasviz_74_trait_LD` 链接到GWAS数据的 `zmap_gwasviz_74_trait_LD` 目录
- 将所用的GWAS数据导入数据库对应的表中，如下： ('文件' --> '对应存储table')
    `zmap_gwasviz_assoc.tsv`       -->     `zmap_gwasviz_assoc`
    `zmap_gwasviz_exon_b73.tsv`    -->     `zmap_gwasviz_exon`
    `zmap_gwasviz_gene_b73.tsv`    -->     `zmap_gwasviz_gene`
    `zmap_gwasviz_transcript_b73.tsv`      -->     `zmap_gwasviz_transcript`
    `zmap_gwasviz_trait_category.tsv`                -->     `zmap_gwasviz_trait_category` 
### 其他
- multi-trait, single-variant与single-trait共用数据，因此不必再单独建表和导入数据


## 开发依赖
- locuszoom (https://github.com/statgen/locuszoom.git)
- ztree (https://gitee.com/zTree/zTree_v3.git)
- echarts (https://github.com/apache/incubator-echarts/archive/4.2.1.tar.gz)