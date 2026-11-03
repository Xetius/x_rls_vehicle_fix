// Adds 0.40 seat support to brodbattletruck's pickup_interior_kodiak.jbeam.
// Usage: node patch_kodiak.js <original jbeam> <output jbeam>
const fs = require('fs');
const [src, out] = process.argv.slice(2);
const NL = '\r\n';
let lines = fs.readFileSync(src, 'utf8').split(/\r?\n/);

const block = (s) => s.replace(/^\n/, '').replace(/\n$/, '').split('\n');
const partStart = (name) => {
  const i = lines.findIndex((l) => l.startsWith(`"${name}"`));
  if (i < 0) throw new Error(`part ${name} not found`);
  return i;
};
const partEnd = (start) => lines.findIndex((l, i) => i > start && /^},?\s*$/.test(l));
const findIn = (name, re, from) => {
  const s = partStart(name), e = partEnd(s);
  for (let i = from === 'end' ? e : s; from === 'end' ? i > s : i < e; from === 'end' ? i-- : i++) if (re.test(lines[i])) return i;
  throw new Error(`${re} not found in ${name}`);
};
const insertAfter = (i, text) => lines.splice(i + 1, 0, ...block(text));
const insertBefore = (i, text) => lines.splice(i, 0, ...block(text));

// occupant slot rows, same shape as the vanilla 0.40 pickup seats
const occupant = (slot, desc, core, move, rot, vars) => `
        ["${slot}", ["seat_occupant"], [], "${core ? 'occupant_generic' : ''}", "${desc}", {${core ? '\n            "coreSlot":true,' : ''}
            "nodeMove":${move},
            "nodeRotate1":{"x":${rot}, "y":0, "z":0},
            "variables": {
${Object.entries(vars).map(([k, v]) => `                "${k}": ${JSON.stringify(v)}`).join(',\n')}
            }
        }],`;
const attach = (mesh, pitch, id, n) => ({
  $seatID: id, $occupant_camPitch: pitch,
  $TriggerHighlightMesh: mesh, $occupantDragCoef: 1, $seatAttachmentStrength: 150000,
  $occupant_attachnodeFL: n[0], $occupant_attachnodeFR: n[1], $occupant_attachnodeRL: n[2],
  $occupant_attachnodeRR: n[3], $occupant_attachnodeTL: n[4], $occupant_attachnodeTR: n[5],
  $occupant_attachnodeRigifier: n[6],
});
const slots2 = (rows) => `
    "slots2": [
        ["name", "allowTypes", "denyTypes", "default", "description"],${rows.join('')}
    ],`;

// 1. the dashboard hosts the front seats in 0.40; default to Kodiak buckets, as the Kodiak configs intend
insertAfter(findIn('pickup_interior_kodiak', /\["kodiak_gauges"/), `
        ["pickup_seat_F","pickup_seat_F_bucket_kodiak","Front Seats"],`);
insertBefore(partStart('pickup_seat_R_kodiak'), `
"pickup_seat_F_bucket_kodiak":{
    "information":{
        "authors":"BeamNG",
        "name":"Kodiak Front Bucket Seats",
    },
    "slotType" : "pickup_seat_F",
    "slots2":[
        ["name",           "allowTypes",       "denyTypes", "default",               "description"],
        ["pickup_seat_FL", ["pickup_seat_FL"], [],          "pickup_kodiak_seat_FL", "Driver Seat",    {"variables":{"$isDriver":"LHD"}}],
        ["pickup_seat_FR", ["pickup_seat_FR"], [],          "pickup_kodiak_seat_FR", "Passenger Seat"],
    ],
},`);

// 2. Kodiak bucket seats: vanilla facelift buckets moved 0.15m back to match the Kodiak seat nodes
for (const side of ['L', 'R']) {
  const name = `pickup_kodiak_seat_F${side}`;
  const x = side === 'L' ? 0.45 : -0.45;
  const nodes = side === 'L'
    ? ['sf1ll', 'sf1l', 'sf2ll', 'sf2l', 'sf3ll', 'sf3l', 'sf4l']
    : ['sf1r', 'sf1rr', 'sf2r', 'sf2rr', 'sf3r', 'sf3rr', 'sf4r'];
  const rig = nodes[6];
  insertAfter(findIn(name, /"slotType"/), slots2([occupant(`seat_occupant_F${side}`,
    side === 'L' ? 'Driver Seat Occupant' : 'Passenger Seat Occupant', true,
    `{"x":${x},"y":0.05,"z":0.86}`, -20, attach(name, 20, `F${side}`, nodes))]));
  insertBefore(findIn(name, /\{"group":""\}/), `
         //seat back rigifier for the 0.40 occupant
         ["${rig}", ${x.toFixed(2)}, 0.8, 1.363, {"collision":false, "selfCollision":false, "group":"", "nodeWeight":1}],`);
  const beamsEnd = (() => { const s = findIn(name, /"beams"/); return lines.findIndex((l, i) => i > s && /^    \],/.test(l)); })();
  const n = side === 'L' ? ['sf2l', 'sf2ll', 'sf3l', 'sf3ll'] : ['sf2r', 'sf2rr', 'sf3r', 'sf3rr'];
  insertBefore(beamsEnd, `
        {"optional":false},
        {"beamPrecompression":1},
        {"beamType":"|NORMAL", "beamLongBound":1.0, "beamShortBound":1.0},
        {"deformLimitExpansion":1.2},
        //seat back rigifier beams: only to seat back nodes
        {"beamSpring":400000,"beamDamp":282},
        {"beamDeform":20000,"beamStrength":"FLT_MAX"},
${n.map((m) => `        ["${rig}", "${m}"],`).join('\n')}
        {"deformLimitExpansion":""},`);
}

// 3. Kodiak rear bench: same nodes as the vanilla facelift bench, so its occupants copy across unchanged
{
  const name = 'pickup_seat_R_kodiak';
  const mesh = 'pickup_kodiak_seats_R';
  insertAfter(findIn(name, /"slotType"/), slots2([
    occupant('seat_occupant_RL', 'Rear Left Occupant', true, '{"x":0.54,"y":0.705,"z":0.86}', -8,
      attach(mesh, 8, 'RL', ['sr1ll', 'sr1', 'sr2ll', 'sr2', 'sr3ll', 'sr3', 'sr4l'])),
    occupant('seat_occupant_RM', 'Rear Middle Occupant', false, '{"x":0.0,"y":0.705,"z":0.86}', -8,
      attach(mesh, 8, 'RM', ['sr1ll', 'sr1rr', 'sr2', 'sr2', 'sr3', 'sr3', 'sr4'])),
    occupant('seat_occupant_RR', 'Rear Right Occupant', true, '{"x":-0.54,"y":0.705,"z":0.86}', -8,
      attach(mesh, 8, 'RR', ['sr1', 'sr1rr', 'sr2', 'sr2rr', 'sr3', 'sr3rr', 'sr4r'])),
  ]));
  insertBefore(findIn(name, /\{"group":""\}/), `
          //seat back rigifiers for the 0.40 occupants
          ["sr4l",  0.462,  1.335,  1.273, {"collision":false, "selfCollision":false, "group":"", "nodeWeight":1}],
          ["sr4",   0.0,    1.335,  1.190, {"collision":false, "selfCollision":false, "group":"", "nodeWeight":1}],
          ["sr4r", -0.462,  1.335,  1.273, {"collision":false, "selfCollision":false, "group":"", "nodeWeight":1}],`);
  const s = findIn(name, /"beams"/);
  const beamsEnd = lines.findIndex((l, i) => i > s && /^    \],/.test(l));
  insertBefore(beamsEnd, `
          {"optional":false},
          {"beamPrecompression":1},
          {"beamType":"|NORMAL", "beamLongBound":1.0, "beamShortBound":1.0},
          {"deformLimitExpansion":1.2},
          //seat back rigifier beams: only to seat back nodes
          {"beamSpring":400000,"beamDamp":86.95},
          {"beamDeform":20000,"beamStrength":"FLT_MAX"},
          ["sr4l", "sr2ll"],
          ["sr4l", "sr2"],
          ["sr4l", "sr3ll"],
          ["sr4l", "sr3"],
          ["sr4",  "sr2"],
          ["sr4",  "sr3"],
          ["sr4",  "sr4l"],
          ["sr4",  "sr4r"],
          ["sr4r", "sr2"],
          ["sr4r", "sr2rr"],
          ["sr4r", "sr3"],
          ["sr4r", "sr3rr"],
          {"deformLimitExpansion":""},`);
}

fs.writeFileSync(out, lines.join(NL));
console.log(`wrote ${out}`);
