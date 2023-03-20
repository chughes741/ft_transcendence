

//get functions for accessing nested object attributes


//Single level
export function get<
	T,
	P1 extends keyof NonNullable<T>
>(obj: T, prop1: P1): NonNullable<T>[P1] | undefined;

//Two levels
export function get<
	T,
	P1 extends keyof NonNullable<T>,
	P2 extends keyof NonNullable<NonNullable<T>[P1]>
>(obj: T, prop1: P1, prop2: P2): NonNullable<NonNullable<T>[P1]>[P2] | undefined;

//Three levels
export function get<
	T,
	P1 extends keyof NonNullable<T>,
	P2 extends keyof NonNullable<NonNullable<T>[P1]>,
	P3 extends keyof NonNullable<NonNullable<NonNullable<T>[P1]>[P2]>
>(obj: T, prop1: P1, prop2: P2, prop3: P3): NonNullable<NonNullable<NonNullable<T>[P1]>[P2]>[P3] | undefined;


//Base function (overloaded by above functions)
export function get(obj: any, ...props: string[]): any {
	return obj && props.reduce(
		(result, prop) => result === null ? undefined : result[prop],
		obj
	);
}