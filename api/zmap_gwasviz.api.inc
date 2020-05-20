<?php

//gwasviz api for retrive trait category
function api_gwasviz_retrive_trait_category($type)
{
    $table = 'zmap_gwasviz_trait_category';
    $img_path = '/'.drupal_get_path('module', 'zmap_gwasviz').'/theme/css/img';
    $res = db_select($table, $table)->fields($table)
        ->execute()
        ->fetchAll(PDO::FETCH_ASSOC);

    $data = [];
    if (!empty($res)) {
        foreach ($res as $k => $v) {
            $node = array(
                'id' => $v['id'],
                'pId' => $v['pid'],
                'name' => $v['name'],
                't' => 'id='.$v['id'],
            );
            if ($v['has_child'] == true) {
                $node['nocheck'] = true;
                $node['icon'] = $img_path.'/folder.png';
            } else {
                $node['icon'] = $img_path.'/trait.png';
            }
            $data[] = $node;
        }
    }

    drupal_json_output($data);
}

//echart gwas api
function api_gwasviz_retrive_echart($trait)
{
    $file = DRUPAL_ROOT.'/'.variable_get('file_public_path', conf_path().'/files').'/zmap_gwasviz_trait_win500K.tsv';
    $command_file = DRUPAL_ROOT.'/'.drupal_get_path('module', 'zmap_gwasviz').'/includes/get_barplot_tsv';
    $command = $command_file." $trait $file";
    exec($command, $output, $returnVar);
    $echartData = [];
    if (!empty($output)) {
        $echart_data = explode(',', trim($output[0], ','));
        foreach ($echart_data as $k => $line) {
            $_line = explode("\t", $line);
            $echartData[] = $_line;
        }
    }
    $data = array(
        'trait' => $trait,
        'echartData' => $echartData,
    );

    drupal_json_output($data);
}

// gwasviz api for retrive gwas gene data
function api_gwasviz_retrive_gene($chr, $start, $end)
{
    $data = [];
    /** 查询gwas gene及gene_id数据 */
    $table_gene = 'zmap_gwasviz_gene';
    $res_genes = db_select($table_gene, $table_gene)->fields($table_gene)
        ->condition('gene_chr', $chr, '=')
        ->condition(db_or()
            ->condition('gene_start', array($start, $end), 'BETWEEN')
            ->condition('gene_end', array($start, $end), 'BETWEEN')
        )
        ->execute()
        ->fetchAll(PDO::FETCH_ASSOC);

    $gene_ids = [];
    if (empty($res_genes)) {
        drupal_json_output($data);
        exit();
    }
    $gene_ids = array_column($res_genes, 'gene_id');
    //$gene_ids = generate_sql_fields($gene_ids);

    /** 查询gwas transcript及trans_id数据，并将transcript按照gene_id分组 */
    $table_trans = 'zmap_gwasviz_transcript';
    $trans = db_select($table_trans, $table_trans)->fields($table_trans)
        ->condition('gene_id', $gene_ids, 'IN')
        ->execute()
        ->fetchAll(PDO::FETCH_ASSOC);
    $trans_ids = [];
    if (empty($trans)) {
        drupal_json_output($data);
        exit();
    }
    $trans_ids = array_column($trans, 'trans_id');
    //$trans_ids = generate_sql_fields($trans_ids);

    /** 查询gwas exon及exon_id数据，并将exon按照trans_id分组 */
    $table_exon = 'zmap_gwasviz_exon';
    $exons = db_select($table_exon, $table_exon)->fields($table_exon)
        ->condition('gene_id', $gene_ids, 'IN')
        ->condition('trans_id', $trans_ids, 'IN')
        ->execute()
        ->fetchAll(PDO::FETCH_ASSOC);

    if (empty($exons)) {
        drupal_json_output($data);
        exit();
    }

    /** exons分组 */
    $trans_exons = [];
    foreach ($exons as $k => $v) {
        $_v = [];
        $transid = trim($v['trans_id']);
        $_v['exon_id'] = trim($v['exon_id']);
        $_v['chrom'] = trim($v['exon_chr']);
        $_v['start'] = (int) $v['exon_start'];
        $_v['end'] = (int) $v['exon_end'];
        $_v['strand'] = trim($v['exon_strand']);
        $trans_exons[$transid][] = $_v;
    }

    /** transcript分组 */
    $transcripts = [];
    foreach ($trans as $k => $v) {
        $_v = [];
        $geneid = trim($v['gene_id']);
        $_v['transcript_id'] = trim($v['trans_id']);
        $_v['transcript_name'] = trim($v['trans_name']);
        $_v['trans_chrom'] = trim($v['trans_chr']);
        $_v['start'] = (int) $v['trans_start'];
        $_v['end'] = (int) $v['trans_end'];
        $_v['strand'] = trim($v['trans_strand']);
        $_v['exons'] = $trans_exons[trim($v['trans_id'])];
        $transcripts[$geneid][] = $_v;
    }

    foreach ($res_genes as $k => $v) {
        $_v = [];
        $_v['gene_id'] = trim($v['gene_id']);
        $_v['gene_name'] = trim($v['gene_name']);
        $_v['chrom'] = trim($v['gene_chr']);
        $_v['start'] = (int) $v['gene_start'];
        $_v['end'] = (int) $v['gene_end'];
        //$v['strand'] = trim($v['strand']);
        $_v['transcripts'] = $transcripts[trim($v['gene_id'])];
        $data[] = $_v;
    }

    drupal_json_output(['data' => $data]);
}

// gwasviz api for retrive gwas assoc data
function api_gwasviz_retrive_assoc($trait, $chr, $start, $end)
{
    $table = 'zmap_gwasviz_assoc';
    $res = db_select($table, $table)->fields($table)
        ->condition('trait', $trait, '=')
        ->condition('chr', $chr, '=')
        ->condition('posi', array($start, $end), 'BETWEEN')
        ->execute()
        ->fetchAll(PDO::FETCH_ASSOC);

    $variant = $position = $pvalue = $analysis = $ref_allele = $log_pvalue = $_chr = [];
    if (!empty($res)) {
        foreach ($res as $k => $v) {
            $analysis[] = 45;
            $_chr[] = $chr;
            $variant[] = trim($v['snpid']);
            $position[] = (int) trim($v['posi']);
            $pvalue[] = pow(10, -$v['log_pvalue']);
            $log_pvalue[] = (float) $v['log_pvalue'];
            $ref_allele[] = $v['ref_allele'];
        }
    }
    $data = [
            'analysis' => $analysis,
            'variant' => $variant,
            'chr' => $_chr,
            'position' => $position,
            'pvalue' => $pvalue,
            'log_pvalue' => $log_pvalue,
            'ref_allele' => $ref_allele,
    ];

    drupal_json_output(['data' => $data]);
}
