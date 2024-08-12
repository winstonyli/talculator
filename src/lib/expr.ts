export const defaultExpr = 'y=x';
// export const defaultExpr = '$$ y=\frac&lbrace;x^2-z^2&rbrace;&lbrace;5&rbrace; $$';

export interface Expr {
	id: string;
	f?: Function;
	color: string;
}

export type Function = (x: number, z: number) => number;
