x_rls_vehicle_fix

Fixes vehicles from pre-0.40 repo mods that spawn with no seats (or "Unseated") in BeamNG 0.40+:
the Kodiak D-Series, the Truck Pulling Parts Pack and Quadrasteer D-Series, and every conventional
T-Series when the Hot Rod Semi Pulling Parts Pack is installed. Also fixes seat highlights on
Bella's Semi Add-on vintage seats and the NBPD D-Series diesel engine's textures. Formerly
x_rls_dseries_fix.

Kodiak D-Series (Gavril D-Series with the Kodiak dashboard, e.g. the "Kodiak Dually Diesel")
spawned with no front seats.

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

Also fixes D-Series configs from two more pre-0.40 repo mods that spawn "Unseated" (no seats for
the player) because their dashboards have no Front Seats slot:
- Truck Pulling Parts Pack (dseries_pulling_v1.zip), all its pulling trucks:
    vehicles/pickup/yb_propull_pickup_interior.jbeam
  The Empty Dashboard gets the Front Seats slot. The file's old copies of vanilla parts
  (pickup_seat_F, pickup_seat_F_bucket, pickup_seat_R, pickup_seat_R_short,
  pickup_interiorpanel_R_short, pickup_shifter_M/_M_sport/_A/_T) are removed. They were pre-0.40
  versions of the same vanilla parts, with no seat occupants, so vanilla's are used instead.
- Quadrasteer (Gavril_4WS.zip), Quadrasteer (A) and Quadrasteer Late (A):
    vehicles/common/Gavril_4WS.jbeam
  The three D-Series Quadrasteer dashboards get the Front Seats slot, with the same defaults as the
  vanilla dashboards they're based on. The Roamer Quadrasteer needs nothing.

And the T-Series (us_semi): with the Hot Rod Semi Pulling Parts Pack (semi_pulling_v1.zip)
installed, every conventional (long nose) T-Series spawned "Unseated", vanilla ones included (137
configs across vanilla and a dozen mods):
    vehicles/us_semi/us_semi_conventional_interior_yb_empty.jbeam
  That file redefines the vanilla driver and passenger seats (us_semi_conventional_seat_L/_R) with
  pre-0.40 copies that have no seat occupants, and the game used them for every T-Series. They're
  removed, so vanilla's are used.

Legacy driver cameras: pre-0.40 dashboards define the driver camera themselves. In 0.40 it comes
from the seat occupant, and vanilla's dashboards have theirs commented out ("driver cam comes from
the seat occupant now"). A dashboard that still has one gets an extra driver camera with no seat.
These dashboards have it commented out the same way:
- Hot Rod Semi Pulling Parts Pack: the Empty Dashboard (in the file above, all the pullers)
- Bella's Semi Add-on (bella_semipack.zip): the chopped and custom dashboards
    vehicles/us_semi/chopped_semi/chopped_conventional_interior.jbeam
    vehicles/us_semi/interior_stuff/custom_interior_accessories.jbeam
- T-Series Drivetrain Expansion (efc_us_semi_drive_exp.zip): the 60 Series shunt, Edison and V8
  dashboards
    vehicles/us_semi/EFC 60 Series/us_semi_shunt_dashboard.jbeam
    vehicles/us_semi/EFC Edison/us_semi_edison_interior.jbeam
    vehicles/us_semi/EFC V8/us_semi_interior_V8.jbeam
- ra66_tseries.zip: the SBA dashboard
    vehicles/us_semi/sba/us_semi_conventional_interior_sba.jbeam

Smaller fixes:
- Bella's Semi Add-on (bella_semipack.zip): its vintage seats (long nose and cabover, both sides)
  had 0.40 occupants but highlighted the vanilla seat meshes, which aren't on the truck, so there
  was no seat highlight. They now highlight their own meshes:
    vehicles/us_semi/interior_stuff/us_semi_conventional_seatss.jbeam
    vehicles/us_semi/interior_stuff/us_semi_cabover_seatss.jbeam
- NBPD D-Series (NBPD_D-Series.zip): its 5.9 diesel engine mesh uses a material,
  belasco_diesel.004, that no mod defines, so the engine had missing textures.
    vehicles/common/pickup/x_rls_vehicle_fix.materials.json
  defines it with the belasco_diesel textures from the Classic Engine Expansion Pack
  (classic_engine_expansion_pack.zip), which must be installed.

These are whole-file overrides at the same paths, so they also rely on the x_ prefix to mount after
the originals. They're meant to be used with those mods installed. Drop each file once its mod is
updated for 0.40.

Regenerating after a brodbattletruck update (if it still needs the fix):
  node tools/patch_kodiak.js <extracted brodbattletruck dir> .
Regenerating after a D-Series pulling pack, Quadrasteer, semi pulling pack, Bella's, Drivetrain
Expansion or ra66_tseries update (run once per extracted mod):
  node tools/patch_seats.js <extracted mod dir> .

Releasing: push a semver tag without a v prefix (e.g. 1.0.0). GitHub Actions builds
x_rls_vehicle_fix_<version>.zip and publishes it as a release.
