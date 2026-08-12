import accessibleAutocomplete from 'accessible-autocomplete';

document.addEventListener('DOMContentLoaded', () => {
  const POLLUTANT_SOURCE = [
    // Particulate (add simple symbols for the base analyte)
    'Particulate calcium (Ca)',
    'Particulate chloride (Cl)',
    'Particulate magnesium (Mg)',
    'Particulate sodium (Na)',
    'Particulate nitrite (NO2)',
    'Particulate nitrate (NO3)',
    'Particulate sulphate (SO4)',

    // Acid gases
    'Hydrochloric acid (HCl)',
    'Nitrous acid (HNO2)',
    'Nitric acid (HNO3)',
    'Ammonia (NH3)',

    // VOCs (left as names only)
    'Ethane',
    'Ethene',
    'Ethyne',
    'Propane',
    'Propene',
    'Iso-butane',
    'N-butane',
    '1-butene',
    'Trans-2-butene',
    'Cis-2-butene',
    'Iso-pentane',
    'N-pentane',
    '1,3-butadiene',
    'Trans-2-pentene',
    '1-pentene',
    '2-methylpentane',
    'Isoprene',
    'N-hexane',
    'N-heptane',
    'Iso-octane',
    'N-octane',
    'Benzene',
    'Toluene',
    'Ethylbenzene',
    'M+p-xylene',
    'O-xylene',

    // Core gases with symbols
    'Carbon monoxide (CO)',
    'Ozone (O3)',
    'Sulphur dioxide (SO2)',
    'Particulate matter (PM10)',
    'Fine particulate matter (PM2.5)',

    // Trimethylbenzene isomers
    '1,2,3-trimethylbenzene',
    '1,2,4-trimethylbenzene',
    '1,3,5-trimethylbenzene',

    // NOx family
    'Nitrogen dioxide (NO2)',
    'Nitrogen oxides as nitrogen dioxide (NOx as NO2)',
    'Nitric oxide (NO)',

    // Black carbon
    'Black carbon (BC)',

    // TOMPs classes
    'PCBs',
    'Co-planar PCBs',
    'PCDDs (dioxins)',
    'PCDFs (furans)',
    'PBDEs',
    'decaBDE',
    'HBCDD',

    // Metals (air)
    'Arsenic (As)',
    'Cadmium (Cd)',
    'Chromium (Cr)',
    'Cobalt (Co)',
    'Copper (Cu)',
    'Iron (Fe)',
    'Lead (Pb)',
    'Manganese (Mn)',
    'Nickel (Ni)',
    'Selenium (Se)',
    'Vanadium (V)',
    'Zinc (Zn)',

    // Metals in precipitation (keep names, add simple element symbols)
    'Aluminium in precipitation (Al)',
    'Antinomy in precipitation (Sb)',     // (kept spelling from your list)
    'Arsenic in precipitation (As)',
    'Barium in precipitation (Ba)',
    'Beryllium in precipitation (Be)',
    'Cadmium in precipitation (Cd)',
    'Caesium in precipitation (Cs)',
    'Chromium in precipitation (Cr)',
    'Cobalt in precipitation (Co)',
    'Copper in precipitation (Cu)',
    'Iron in precipitation (Fe)',
    'Lead in precipitation (Pb)',
    'Lithium in precipitation (Li)',
    'Manganese in precipitation (Mn)',
    'Mercury in precipitation (Hg)',
    'Molybdenum in precipitation (Mo)',
    'Nickel in precipitation (Ni)',
    'Rubidium in precipitation (Rb)',
    'Selenium in precipitation (Se)',
    'Strontium in precipitation (Sr)',
    'Tin in precipitation (Sn)',
    'Titanium in precipitation (Ti)',
    'Tungsten in precipitation (W)',
    'Uranium in precipitation (U)',
    'Vanadium in precipitation (V)',
    'Zinc in precipitation (Zn)',

    // Ions in PM10
    'Calcium in PM10 (Ca)',
    'Chloride in PM10 (Cl)',
    'Potassium in PM10 (K)',
    'Magnesium in PM10 (Mg)',
    'Sodium in PM10 (Na)',
    'Ammonium in PM10 (NH4)',
    'Nitrate in PM10 (NO3)',
    'Sulphate in PM10 (SO4)',

    // Ions in PM2.5
    'Calcium in PM2.5 (Ca)',
    'Chloride in PM2.5 (Cl)',
    'Potassium in PM2.5 (K)',
    'Magnesium in PM2.5 (Mg)',
    'Sodium in PM2.5 (Na)',
    'Ammonium in PM2.5 (NH4)',
    'Nitrate in PM2.5 (NO3)',
    'Sulphate in PM2.5 (SO4)',



    // PAHs (left as names only)
    'Benzo(a)pyrene',
    'Benzo(a)anthracene',
    'Benzo(b)fluoranthene',
    'Benzo(j)fluoranthene',
    'Benzo(b+j)fluoranthene',
    'Benzo(k)fluoranthene',
    'Indeno(1,2,3-cd)pyrene',
    'Dibenzo(ac)anthracene',
    'Dibenzo(ah)anthracene',
    'Dibenzo(ah+ac)anthracene',
    '1-Methyl anthracene',
    '1-Methyl Naphthalene',
    '1-Methyl phenanthrene',
    '2-Methyl anthracene',
    '2-Methyl Naphthalene',
    '2-Methyl phenanthrene',
    '4.5-Methylene phenanthrene',
    '5-Methyl Chrysene',
    '9-Methyl anthracene',

    // Mercury
    'Reactive mercury (Hg)',
    'Elemental mercury (Hg)',
    'Mercury in PM2.5 (Hg)',

    // Ammonia flavours
    'Gaseous ammonia (active) (NH3)',
    'Gaseous ammonia (passive) (NH3)',
    'Particulate ammonium (NH4)',
    'Gaseous ammonia (diffusion tube) (NH3)'
  ];

  accessibleAutocomplete({
    element: document.querySelector('#autocomplete-container-p'),
    id: 'my-autocomplete',
    source: POLLUTANT_SOURCE
  });
});
