<?php

function api_gwasviz_single_variant_retrive_phewas($variant)
{
    $trait_category_table = 'zmap_gwasviz_trait_category';
    $trait_category = [];
    $traits = db_select($trait_category_table, $trait_category_table)->fields($trait_category_table)
        ->execute()
        ->fetchAll(PDO::FETCH_ASSOC);
    if (!empty($traits)) {
        foreach ($traits as $k => $v) {
            if ((int) $v['pid'] == 0) {
                $category[$v['id']] = trim($v['name']);
            }
        }
        foreach ($traits as $k => $v) {
            if ((int) $v['pid'] != 0) {
                $trait = trim($v['name']);
                $trait_category["$trait"] = $category[$v['pid']];
            }
        }
    }

    $table = 'zmap_gwasviz_assoc';
    $res = db_select($table, $table)->fields($table)
        ->condition('snpid', $variant, '=')
        ->execute()
        ->fetchAll(PDO::FETCH_ASSOC);
    $data = [];
    $i = 1;
    if (!empty($res)) {
        foreach ($res as $k => $v) {
            $data[] = array(
                'build' => 'mays',
                'chromosome' => $v['chr'],
                'description' => '',
                'id' => $i++,
                'log_pvalue' => $v['log_pvalue'],
                'pmid' => '',
                'position' => $v['posi'],
                'ref_allele' => trim($v['ref_allele']),
                'ref_allele_freq' => '',
                'score_test_stat' => '',
                'study' => '',
                'tech' => '',
                'trait' => trim($v['trait']),
                'trait_group' => $trait_category[trim($v['trait'])],
                'trait_label' => trim($v['trait']),
                'variant' => trim($v['snpid']),
            );
        }
    }

    drupal_json_output(['data' => $data]);
}
