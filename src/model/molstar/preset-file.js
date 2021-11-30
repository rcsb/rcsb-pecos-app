import PropsetPreset from "./preset-propset";
import StructureFileFormatEnum from "../enum/enum-file-format";
import { clean } from '../../utils/common';

class FilePreset {
    url;
    format;
    isBinary;
    matrix;
    props;

    constructor() {}

    setURL(url) {
        this.url=url;
    }
    getURL() {
        return this.url;
    }
    setFormat(format) {
        switch (format) {
            case StructureFileFormatEnum.PDB.value:
                this.format = 'pdb';
                break;
            case StructureFileFormatEnum.MMCIF.value:
            case StructureFileFormatEnum.BINARY_CIF.value:
                this.format = 'mmcif';
                break;
            default:
                throw new Error('Unsupported file format: '+format);
        }
    }
    getFormat() {
        return this.format;
    }
    setIsBinary(is_binary) {
        this.isBinary=is_binary;
    }
    getIsBinary() {
        return this.isBinary;
    }
    setMatrix(matrix) {
        this.matrix = matrix;
    }
    getMatrix() {
        return this.matrix;
    }
    setProps(props) {
        this.props=props;
    }
    getProps() {
        if (!this.props) this.props = new PropsetPreset();
        return this.props;
    }
    toString() {
        return JSON.stringify(this);
    }
    toObject() {
        const json = JSON.parse(this.toString());
        clean(json);
        return json;
    }
}

export default FilePreset;