# ZEAMAP GWAS Visualization module

A drupal module for GWAS signals visualization in [ZEAMAP](http://www.zeamap.com/). 

The visualization mainly include two plots: **Navigational Manhattan Plot** and **Detailed Scatter Plot**

- Navigational Manhattan Plot

    This panel shows the most significant P-value (Y-axis) between the selected trait and the genetic variants within 500Kb sliding window of the genome (X-axis). You can navigate to your interested region by zoom and drag. Click on the region will generat a gray vertical indicator, and draw 'Detailed Scatter Plot' of this region below.

- Detailed Scatter Plot

    This panel shows the detailed plot of the variants and the genes within a certain region. Currently, only variants with -Log10(P-value) greater than 5 were displayed. The dots were colored by LD r2 value with the 'ref-variant' ( If not specified, the variant with the most significant P-value was set as the default ref-variant. ). The gene information tooltip provides interfaces for connecting with the gene detailed information, genome browser and eQTL signals. Please notice that the min and max plot regions of the scatter plot are 20 Kb and 1 Mb, respectively. If your input region was smaller than 20 Kb (or larger than 1Mb), the flanking 20 Kb (or 1 Mb) of the middle position was plotted.

Find a demo here: [DEMO](http://www.zeamap.com/gwasviz/single_trait)

## Platform

- Drupal 7.x
- Tripal 7.x-3.x

## Prerequisite

- [csvtk](https://github.com/shenwei356/csvtk) (version 0.16.0 was used in ZEAMAP)
- [locuszoom](https://github.com/statgen/locuszoom.git) (version 0.9.1 was used in ZEAMAP)
- [ztree](https://gitee.com/zTree/zTree_v3.git) (version 3 was used in ZEAMAP)
- [echarts](https://github.com/apache/incubator-echarts/archive/4.2.1.tar.gz) (version 4.2.1 was used in ZEAMAP)

## Installation and Usage

1. Make sure all the prerequisite packages were correctly installed, and csvtk was added to the `$PATH` variable.
2. Download this repository, switch to drupal environment, and lunch this module with
    `drush en -y zmap_gwasvis`
3. Prepare necessary information and save to related tables in database as follows:

    | Table_Name                          | Description                                                                             |
    | :---------------------------------- | :-------------------------------------------------------------------------------------- |
    | zmap_gwasviz_assoc                  | stores significant P values and necessary information of each variant-trait association |
    | zmap_gwasviz_trait_category         | stores trait category information                                                       |
    | zmap_gwasviz_[gene/exon/transcript] | stores gene annotations for locuszoom visualization                                     |

    The format of each table were listed as follows:


    **zmap_gwasviz_assoc**


    | Trait | Variant       | Chr  | Position | -log(P-value)    | Ref-allele | Alt-allele |
    | :---- | :------------ | :--- | :------- | :--------------- | :--------- | :--------- |
    | SA    | chr1.s_29106  | 1    | 29106    | 5.79988374054394 | A          | G          |
    | SA    | chr1.s_34867  | 1    | 34867    | 5.12419680136797 | A          | T          |
    | SA    | chr1.s_111303 | 1    | 111303   | 5.87131754204541 | T          | C          |

    **zmap_gwasviz_trait_category**

    ```
    Column 1: number of lines
    Column 2: trait_id or Category_id
    Column 3: hierarchy orders
    ```

    | No   | Name      | Category |
    | :--- | :-------- | :------- |
    | 1    | AminoAcid | 0        |
    | 2    | Ala       | 1        |
    | 3    | Arg       | 1        |
    | 4    | Asp       | 1        |
    | 5    | Cys       | 1        |

    **zmap_gwasviz_[gene/exon/transcript]**


    ```bash
    ==> zmap_gwasviz_gene <==
    # GeneID GeneName Chr start end strand
    Zm00001d027230  Zm00001d027230  1       44289   49837   +
    Zm00001d027231  Zm00001d027231  1       50877   55716   -
    Zm00001d027232  Zm00001d027232  1       92299   95134   -

    ==> zmap_gwasviz_transcript <==
    #GeneID TranscriptID TranscriptID chr start end strand
    Zm00001d027230  Zm00001d027230_T001     Zm00001d027230_T001     1       44289   49837   +
    Zm00001d027231  Zm00001d027231_T001     Zm00001d027231_T001     1       50877   51964   -
    Zm00001d027231  Zm00001d027231_T002     Zm00001d027231_T002     1       50877   55716   -

    ==> zmap_gwasviz_exon <==
    #GeneID TranscriptID ExonID chr start end strand
    Zm00001d027230  Zm00001d027230_T001     Zm00001d027230_T001.exon1       1       44289   44947   +
    Zm00001d027230  Zm00001d027230_T001     Zm00001d027230_T001.exon2       1       45666   45803   +
    Zm00001d027230  Zm00001d027230_T001     Zm00001d027230_T001.exon3       1       45888   46133   +

    ```
4. Prepare a slide-window gwas **-log(P-value)** file that includes all traits with format:

    | Chr  | Region            | Trait1           | Trait2           | Trait3           | Trait4           | Trait5           |
    | :--- | :---------------- | :--------------- | :--------------- | :--------------- | :--------------- | :--------------- |
    | chr1 | 1:0-500000        | 2.31630146832606 | 1.80738619280076 | 2.3600932652674  | 3.4697375322046  | 2.81576439173472 |
    | chr1 | 1:500000-1000000  | 2.16586921946003 | 2.47204817043131 | 2.44478374829681 | 2.3009311614868  | 3.06381763398639 |
    | chr1 | 1:1000000-1500000 | 2.20326973727822 | 2.14769705404575 | 2.80501221615503 | 2.62926990990414 | 3.24533370587843 |
    | chr1 | 1:1500000-2000000 | 2.45927445908454 | 2.40150025060532 | 3.42899149389656 | 3.20341456675297 | 4.17005330405836 |
    | chr1 | 1:2000000-2500000 | 2.77801464282688 | 2.4586176059459  | 2.7616131219865  | 3.05707419839616 | 3.24747447471538 |
    | chr1 | 1:2500000-3000000 | 4.03574036980315 | 2.51863176692419 | 2.83982209620494 | 3.03474278058476 | 3.924796230317   |
    | ...  | ...               | ...              | ...              | ...              | ...              | ...              |

    and put (or link) the file into Drupal public file directory `sites/default/files/gwasviz_74_trait_win500K.tsv`.

5. Prepare a directory that stores pairwise LD scores of variants for each trait, and the LD file should be named with trait name as prefix and ".LD" as suffix with format as follows (no header line):

    | Site1            | Site2            | R2     |
    | :--------------- | :--------------- | :----- |
    | chr5.s_209839785 | chr5.s_209839830 | 0.3034 |
    | chr5.s_209839785 | chr5.s_209839926 | 0.3581 |
    | chr5.s_209839785 | chr5.s_209839951 | 0.3547 |
    | chr5.s_209839785 | chr5.s_209840008 | 0.3304 |

    and then put (or link) the directory to `sites/default/files/zmap_gwasviz_74_trait_LD`

