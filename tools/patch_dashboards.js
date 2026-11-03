// Adds the BeamNG 0.40 Front Seats slot to D-Series dashboards from other mods.
// Usage: node patch_dashboards.js <extracted mod dir> <output dir>
//   patches whichever of the known files below exist in the extracted mod (run it once per mod) and
//   writes the patched copies to the same paths under <output dir>
//   - dseries_pulling_v1.zip (Truck Pulling Parts Pack): vehicles/pickup/yb_propull_pickup_interior.jbeam
//   - Gavril_4WS.zip (Quadrasteer):                      vehicles/common/Gavril_4WS.jbeam
const fs = require('fs');
const path = require('path');
const [srcDir, outDir] = process.argv.slice(2);
const NL = '\r\n';
let lines;

const partStart = (name) => {
  const i = lines.findIndex((l) => new RegExp(`^\\s*"${name}"\\s*:`).test(l));
  if (i < 0) throw new Error(`part ${name} not found`);
  return i;
};
const partEnd = (start) => lines.findIndex((l, i) => i > start && /^},?\s*$/.test(l));

// In 0.40 the dashboard hosts the front seats (the seats carry the occupant and driver camera).
// Pre-0.40 dashboards have no such slot, so the truck spawns with no seats and the player is "Unseated".
const addFrontSeats = (name, defaultSeat) => {
  const s = partStart(name), e = partEnd(s);
  const slots = lines.findIndex((l, i) => i > s && i < e && /"slots2"/.test(l));
  if (slots < 0) throw new Error(`slots2 not found in ${name}`);
  if (lines.slice(slots, e).some((l) => /\["pickup_seat_F",/.test(l))) throw new Error(`${name} already has pickup_seat_F`);
  const close = lines.findIndex((l, i) => i > slots && /^\s*\],/.test(l));
  const indent = lines[close - 1].match(/^\s*/)[0];
  lines.splice(close, 0, `${indent}["pickup_seat_F", ["pickup_seat_F"], [], "${defaultSeat}", "Front Seats"],`);
};

// The pulling pack's dashboard file also carries old copies of vanilla parts under the same names.
// Their seats have no 0.40 occupants, and which copy the game picks for a duplicate name isn't
// something to rely on, so drop them and let vanilla's (same parts, updated for 0.40) be used.
const removePart = (name) => {
  const s = partStart(name);
  lines.splice(s, partEnd(s) - s + 1);
};

function patchPulling() {
  addFrontSeats('yb_propull_pickup_interior', 'pickup_seat_F');
  for (const name of ['pickup_seat_F', 'pickup_seat_F_bucket', 'pickup_seat_R', 'pickup_seat_R_short',
    'pickup_interiorpanel_R_short', 'pickup_shifter_M', 'pickup_shifter_M_sport', 'pickup_shifter_A',
    'pickup_shifter_T']) removePart(name);
}

function patchQuadrasteer() {
  // same defaults as the vanilla dashboards they're copied from (pickup_interior, pickup_interior_facelift
  // and pickup_interior_alt_facelift); the Roamer dashboard needs nothing, its seats hang off the body
  addFrontSeats('pickup_Quadrasteer_interior', 'pickup_seat_F');
  addFrontSeats('pickup_interior_Quadrasteer_facelift', 'pickup_seat_F_facelift');
  addFrontSeats('pickup_Quadrasteer_interior_alt_facelift', 'pickup_seat_F_facelift');
}

const files = {
  'vehicles/pickup/yb_propull_pickup_interior.jbeam': patchPulling,
  'vehicles/common/Gavril_4WS.jbeam': patchQuadrasteer,
};
let found = 0;
for (const [rel, patch] of Object.entries(files)) {
  const src = path.join(srcDir, rel);
  if (!fs.existsSync(src)) continue;
  found++;
  lines = fs.readFileSync(src, 'utf8').split(/\r?\n/);
  patch();
  const out = path.join(outDir, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, lines.join(NL));
  console.log(`wrote ${out}`);
}
if (!found) throw new Error(`none of ${Object.keys(files).join(', ')} found in ${srcDir}`);
