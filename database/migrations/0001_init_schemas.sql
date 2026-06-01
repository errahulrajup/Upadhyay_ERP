-- Upadhyay_ERP initial schemas
-- Phase 1 foundation only. Business tables start in Phase 2.

create schema if not exists iam;
create schema if not exists md;
create schema if not exists inv;
create schema if not exists mfg;
create schema if not exists qa;
create schema if not exists fin;
create schema if not exists rnd;
create schema if not exists dms;
create schema if not exists cms;
create schema if not exists log;

create extension if not exists pgcrypto;

