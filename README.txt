x_rls_dseries_fix

Fixes Kodiak D-Series (Gavril D-Series with the Kodiak dashboard, e.g. the "Kodiak Dually Diesel")
spawning with no front seats in BeamNG 0.40+.

The Kodiak parts come from the repo mod brodbattletruck.zip (last updated 2025-03), which predates
0.40. In 0.40 the front seats hang off the interior part and seats need occupant slots; the Kodiak
interior has neither. This mod replaces two brodbattletruck files at the same paths, so it must mount
after brodbattletruck.zip (the x_ prefix takes care of that):
  vehicles/pickup/body/pickup_interior_kodiak.jbeam
  vehicles/pickup/body/pickup_body_crew_sunroof.jbeam

Changes:
- Kodiak dashboard gets a Front Seats slot, default pickup_seat_F_bucket_kodiak (new part: Kodiak
  bucket seats, driver on the left)
- Kodiak driver/passenger seats and the Kodiak rear bench get 0.40 occupant slots and seat back
  rigifier nodes, copied from the vanilla facelift seats (front ones moved 0.15m back to match the
  Kodiak seat nodes)
- Sunroof crew cab (Contender, Kodiak, Off-Road, Powerhouse, Roadsport Crew, Sport, Baron Special)
  loses its pre-0.40 Front Seats slot, which spawned a second set of seats on top of the dashboard's
  and made the truck go unstable, and places its rear seats with nodeOffset like vanilla's crew cab,
  so the rear occupants (and their highlight) move with the bench instead of sitting 0.28m off it

Requires brodbattletruck.zip. Remove this mod once brodbattletruck is updated for 0.40.

Regenerating after a brodbattletruck update (if it still needs the fix):
  node tools/patch_kodiak.js <extracted brodbattletruck dir> .

Releasing: push a semver tag without a v prefix (e.g. 1.0.0). GitHub Actions builds
x_rls_dseries_fix_<version>.zip and publishes it as a release.
