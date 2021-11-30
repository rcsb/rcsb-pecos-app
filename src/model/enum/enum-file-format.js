
export const StructureFileFormatEnum = Object.freeze({
  MMCIF: {
    id: 1,
    value: 'mmcif',
    name: 'mmCIF'
  },
  PDB: {
    id: 2,
    value: 'pdb',
    name: 'PDB',
  }
});

export const FILE_FORMAT_DEFAULT = StructureFileFormatEnum.MMCIF;

export default StructureFileFormatEnum;