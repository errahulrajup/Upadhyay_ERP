-- Upadhyay_ERP deterministic reference seed

insert into iam.users(id, email, display_name, status)
values
  ('00000000-0000-0000-0000-000000000001', 'admin@upadhyay-erp.local', 'System Admin', 'ACTIVE'),
  ('00000000-0000-0000-0000-000000000002', 'qc@upadhyay-erp.local', 'QC Lead', 'ACTIVE'),
  ('00000000-0000-0000-0000-000000000003', 'operator@upadhyay-erp.local', 'Production Operator', 'ACTIVE'),
  ('00000000-0000-0000-0000-000000000004', 'accounts@upadhyay-erp.local', 'Accounts User', 'ACTIVE')
on conflict (email) do nothing;

insert into iam.user_roles(user_id, role_id)
select u.id, r.id
from iam.users u
join iam.roles r on r.code = case
  when u.email like 'admin%' then 'ADMIN'
  when u.email like 'qc%' then 'QC'
  when u.email like 'operator%' then 'OPERATOR'
  when u.email like 'accounts%' then 'ACCOUNTS'
end
where u.email in (
  'admin@upadhyay-erp.local',
  'qc@upadhyay-erp.local',
  'operator@upadhyay-erp.local',
  'accounts@upadhyay-erp.local'
)
on conflict do nothing;

insert into md.suppliers(id, code, name, gstin)
values
  ('10000000-0000-0000-0000-000000000001', 'SUP-AGRO', 'Agro Supplies', '09AAAAA0000A1Z5'),
  ('10000000-0000-0000-0000-000000000002', 'SUP-OIL', 'Oil Corp', '09BBBBB0000B1Z5')
on conflict (code) do nothing;

insert into md.materials(id, code, name, category, unit)
values
  ('20000000-0000-0000-0000-000000000001', 'RM-SHEA', 'Shea Butter', 'Raw Material', 'kg'),
  ('20000000-0000-0000-0000-000000000002', 'RM-COCO', 'Coconut Oil', 'Raw Material', 'kg')
on conflict (code) do nothing;

insert into md.products(id, sku, name, category, unit)
values
  ('30000000-0000-0000-0000-000000000001', 'FG-BUTTER-001', 'Plant Butter', 'Finished Goods', 'kg')
on conflict (sku) do nothing;

insert into md.customers(id, code, name, gstin)
values
  ('40000000-0000-0000-0000-000000000001', 'CUST-METRO', 'Metro Retail', '09CCCCC0000C1Z5')
on conflict (code) do nothing;

insert into mfg.recipes(id, product_id, recipe_code, name, status, created_by)
values (
  '50000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  'RCP-BUTTER',
  'Plant Butter Base Recipe',
  'ACTIVE',
  '00000000-0000-0000-0000-000000000001'
)
on conflict (recipe_code) do nothing;

insert into mfg.recipe_versions(id, recipe_id, version_no, output_qty, output_unit, expected_loss_pct, labor_rate_per_hour, status, approved_by, approved_at)
values (
  '51000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',
  1,
  1,
  'kg',
  2,
  150,
  'APPROVED',
  '00000000-0000-0000-0000-000000000001',
  now()
)
on conflict (recipe_id, version_no) do nothing;

update mfg.recipes
set active_version_id = '51000000-0000-0000-0000-000000000001'
where id = '50000000-0000-0000-0000-000000000001'
  and active_version_id is null;

insert into mfg.recipe_bom_lines(recipe_version_id, material_id, qty, unit, tolerance_pct)
values
  ('51000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 0.6, 'kg', 2),
  ('51000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 0.3, 'kg', 2)
on conflict (recipe_version_id, material_id) do nothing;

insert into mfg.recipe_steps(recipe_version_id, step_no, name, instruction)
values
  ('51000000-0000-0000-0000-000000000001', 1, 'Mixing', 'Mix raw materials until homogeneous.'),
  ('51000000-0000-0000-0000-000000000001', 2, 'Cooling', 'Cool batch before QC hold.')
on conflict (recipe_version_id, step_no) do nothing;

