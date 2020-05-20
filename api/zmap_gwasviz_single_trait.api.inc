<?php

//gwasviz single trait api for retrive gwas ld data
function api_gwasviz_single_trait_retrive_ld($trait, $chr, $start, $end, $ref)
{
    $table_assoc = 'zmap_gwasviz_assoc';

    $res_assoc = db_select($table_assoc, $table_assoc)->fields($table_assoc, array('snpid'))
        ->condition('trait', $trait, '=')
        ->condition('chr', $chr, '=')
        ->condition('posi', array($start, $end), 'BETWEEN')
        ->execute()
        ->fetchAll(PDO::FETCH_ASSOC);

    $snpids = [];

    if (!empty($res_assoc)) {
        $snpids = array_column($res_assoc, 'snpid');
        $snpids = implode(',', $snpids);
    }

    $variant2 = $chromosome2 = $position2 = $rsquare = [];
    $path = DRUPAL_ROOT.'/'.drupal_get_path('module', 'zmap_gwasviz');
    $ld_path = DRUPAL_ROOT.'/'.variable_get('file_public_path', conf_path().'/files').'/zmap_gwasviz_trait_LD/'.$trait.'.LD';
    $command_path = $path.'/includes';
    $command = 'bash '.$command_path.'/get_refLD'." $ref"." $snpids"." $ld_path";
    exec($command, $ref_ld, $returnVar);

    if (!empty($ref_ld)) {
        $ld_arr = explode(',', trim($ref_ld[0], ','));
        foreach ($ld_arr as $k => $line) {
            $ld = explode("\t", $line);
            if (!empty($ld)) {
                $site2 = str_replace('.', '_', @trim($ld[1]));
                $site2 = explode('_', $site2);
                $variant2[] = @trim($ld[1]);
                $chromosome2[] = $chr;
                $position2[] = (int) @$site2[2];
                $rsquare[] = (float) @$ld[2];
            }
        }
    }
    $data = [
        'variant2' => $variant2,
        'chromosome2' => $chromosome2,
        'position2' => $position2,
        'rsquare' => $rsquare,
    ];

    drupal_json_output(['data' => $data]);
}

//api for single trait retrive trait bestRegion
function api_gwasviz_single_trait_retrive_best_region($trait)
{
    $file = DRUPAL_ROOT.'/'.variable_get('file_public_path', conf_path().'/files').'/zmap_gwasviz_trait_win500K.tsv';
    $command_file = DRUPAL_ROOT.'/'.drupal_get_path('module', 'zmap_gwasviz').'/includes/get_barplot_tsv';
    $command = $command_file." $trait $file bestregion";
    $bestRegion = '';
    exec($command, $bestRegion, $returnVar);
    if (!empty($bestRegion)) {
        drupal_json_output(['best_region' => $bestRegion[0]]);
    }
}
