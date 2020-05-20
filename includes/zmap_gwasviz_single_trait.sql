--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.9
-- Dumped by pg_dump version 9.5.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: zmap_gwasviz_assoc; Type: TABLE; Schema: public; Owner: tripal
--

CREATE TABLE zmap_gwasviz_assoc (
    trait character varying(255),
    snpid character varying(255),
    chr integer,
    posi integer,
    log_pvalue double precision,
    ref_allele character varying(255),
    alt character varying(255)
);


ALTER TABLE zmap_gwasviz_assoc OWNER TO tripal;

--
-- Name: TABLE zmap_gwasviz_assoc; Type: COMMENT; Schema: public; Owner: tripal
--

COMMENT ON TABLE zmap_gwasviz_assoc IS 'This table used for store zmap gwas assoc info';


--
-- Name: zmap_gwasviz_exon; Type: TABLE; Schema: public; Owner: tripal
--

CREATE TABLE zmap_gwasviz_exon (
    gene_id character varying(32),
    trans_id character varying(32),
    exon_id character varying(128),
    exon_chr character varying(16),
    exon_start integer,
    exon_end integer,
    exon_strand character(2)
);


ALTER TABLE zmap_gwasviz_exon OWNER TO tripal;

--
-- Name: TABLE zmap_gwasviz_exon; Type: COMMENT; Schema: public; Owner: tripal
--

COMMENT ON TABLE zmap_gwasviz_exon IS 'This table used for store zmap gwas gene exon info';


--
-- Name: zmap_gwasviz_gene; Type: TABLE; Schema: public; Owner: tripal
--

CREATE TABLE zmap_gwasviz_gene (
    gene_id character varying(32),
    gene_name character varying(64),
    gene_chr character varying(16),
    gene_start integer,
    gene_end integer,
    gene_strand character(2)
);


ALTER TABLE zmap_gwasviz_gene OWNER TO tripal;

--
-- Name: TABLE zmap_gwasviz_gene; Type: COMMENT; Schema: public; Owner: tripal
--

COMMENT ON TABLE zmap_gwasviz_gene IS 'This table used for store zmap gwas gene info';


--
-- Name: zmap_gwasviz_trait_category; Type: TABLE; Schema: public; Owner: tripal
--

CREATE TABLE zmap_gwasviz_trait_category (
    id integer,
    name character varying(32),
    pid integer,
    has_child boolean
);


ALTER TABLE zmap_gwasviz_trait_category OWNER TO tripal;

--
-- Name: TABLE zmap_gwasviz_trait_category; Type: COMMENT; Schema: public; Owner: tripal
--

COMMENT ON TABLE zmap_gwasviz_trait_category IS 'This table used for store zmap gwas trait category info';


--
-- Name: zmap_gwasviz_transcript; Type: TABLE; Schema: public; Owner: tripal
--

CREATE TABLE zmap_gwasviz_transcript (
    gene_id character varying(32),
    trans_id character varying(32),
    trans_name character varying(32),
    trans_chr character varying(16),
    trans_start integer,
    trans_end integer,
    trans_strand character(2)
);


ALTER TABLE zmap_gwasviz_transcript OWNER TO tripal;

--
-- Name: TABLE zmap_gwasviz_transcript; Type: COMMENT; Schema: public; Owner: tripal
--

COMMENT ON TABLE zmap_gwasviz_transcript IS 'This table used for store zmap gwas gene transcript info';


--
-- Name: zmap_gwasviz_assoc_posi_idx; Type: INDEX; Schema: public; Owner: tripal
--

CREATE INDEX zmap_gwasviz_assoc_posi_idx ON zmap_gwasviz_assoc USING btree (posi);


--
-- Name: zmap_gwasviz_assoc_trait_idx; Type: INDEX; Schema: public; Owner: tripal
--

CREATE INDEX zmap_gwasviz_assoc_trait_idx ON zmap_gwasviz_assoc USING btree (trait);


--
-- Name: zmap_gwasviz_exon_gene_id_idx; Type: INDEX; Schema: public; Owner: tripal
--

CREATE INDEX zmap_gwasviz_exon_gene_id_idx ON zmap_gwasviz_exon USING btree (gene_id);


--
-- Name: zmap_gwasviz_exon_trans_id_idx; Type: INDEX; Schema: public; Owner: tripal
--

CREATE INDEX zmap_gwasviz_exon_trans_id_idx ON zmap_gwasviz_exon USING btree (trans_id);


--
-- Name: zmap_gwasviz_gene_gene_end_idx; Type: INDEX; Schema: public; Owner: tripal
--

CREATE INDEX zmap_gwasviz_gene_gene_end_idx ON zmap_gwasviz_gene USING btree (gene_end);


--
-- Name: zmap_gwasviz_gene_gene_start_idx; Type: INDEX; Schema: public; Owner: tripal
--

CREATE INDEX zmap_gwasviz_gene_gene_start_idx ON zmap_gwasviz_gene USING btree (gene_start);


--
-- Name: zmap_gwasviz_transcript_gene_id_idx; Type: INDEX; Schema: public; Owner: tripal
--

CREATE INDEX zmap_gwasviz_transcript_gene_id_idx ON zmap_gwasviz_transcript USING btree (gene_id);


--
-- PostgreSQL database dump complete
--

