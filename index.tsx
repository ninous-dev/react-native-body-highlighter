import React, { memo, useCallback } from "react";
import { Platform } from "react-native";
import { Path } from "react-native-svg";
import differenceWith from "ramda/src/differenceWith";
import { bodyFront } from "./assets/bodyFront";
import { bodyBack } from "./assets/bodyBack";
import { SvgMaleWrapper } from "./components/SvgMaleWrapper";
import { bodyFemaleFront } from "./assets/bodyFemaleFront";
import { bodyFemaleBack } from "./assets/bodyFemaleBack";
import { SvgFemaleWrapper } from "./components/SvgFemaleWrapper";

export type Slug =
  | "abs"
  | "adductors"
  | "ankles"
  | "biceps"
  | "calves"
  | "chest"
  | "deltoids"
  | "deltoids"
  | "feet"
  | "forearm"
  | "gluteal"
  | "hamstring"
  | "hands"
  | "hair"
  | "head"
  | "knees"
  | "lower-back"
  | "neck"
  | "obliques"
  | "quadriceps"
  | "tibialis"
  | "trapezius"
  | "triceps"
  | "upper-back";

export interface BodyPart {
  color?: string;
  slug?: Slug;
  path?: {
    common?: string[];
    left?: string[];
    right?: string[];
  };
}

export interface ExtendedBodyPart extends BodyPart {
  intensity?: number;
  side?: "left" | "right";
}

export type BodyProps = {
  colors?: ReadonlyArray<string>;
  data: ReadonlyArray<ExtendedBodyPart>;
  scale?: number;
  side?: "front" | "back";
  gender?: "male" | "female";
  onBodyPartPress?: (b: ExtendedBodyPart, side?: "left" | "right") => void;
  border?: string | "none";
};

const comparison = (a: ExtendedBodyPart, b: ExtendedBodyPart) =>
  a.slug === b.slug;

const Body = ({
  colors = ["#0984e3", "#74b9ff"],
  data,
  scale = 1,
  side = "front",
  gender = "male",
  onBodyPartPress,
  border = "#dfdfdf",
}: BodyProps) => {
  const mergedBodyParts = useCallback(
    (dataSource: ReadonlyArray<BodyPart>) => {
      const innerData = data
        .map((d) => {
          let foundedBodyPart = dataSource.find((e) => e.slug === d.slug);
          return foundedBodyPart;
        })
        .filter(Boolean);

      const coloredBodyParts = innerData.map((d) => {
        const bodyPart = data.find((e) => e.slug === d?.slug);
        let colorIntensity = 1;
        if (bodyPart?.intensity) colorIntensity = bodyPart.intensity;
        return { ...d, color: colors[colorIntensity - 1] };
      });

      const formattedBodyParts = differenceWith(comparison, dataSource, data);

      return [...formattedBodyParts, ...coloredBodyParts];
    },
    [data, colors]
  );

  const getColorToFill = (bodyPart: ExtendedBodyPart) => {
    let color;

    if (bodyPart.intensity) {
      color = colors[bodyPart.intensity];
    } else {
      color = bodyPart.color;
    }

    return color;
  };

  const renderBodySvg = (bodyToRender: ReadonlyArray<BodyPart>) => {
    const SvgWrapper = gender === "male" ? SvgMaleWrapper : SvgFemaleWrapper;

    return (
      <SvgWrapper side={side} scale={scale} border={border}>
        {mergedBodyParts(bodyToRender).map((bodyPart: ExtendedBodyPart) => {
          const commonPaths = (bodyPart.path?.common || []).map((path) => {
            const dataCommonPath = data.find((d) => d.slug === bodyPart.slug)?.path?.common;
            return (
              <Path
                key={path}
                id={bodyPart.slug}
                d={path}
                fill={dataCommonPath ? getColorToFill(bodyPart) : bodyPart.color}
                stroke="#000"
                strokeWidth={0.5}
                {...(Platform.OS === "web"
                  ? { onPress: () => onBodyPartPress?.(bodyPart) }
                  : { onPressIn: () => onBodyPartPress?.(bodyPart) })}
              />
            );
          });

          const leftPaths = (bodyPart.path?.left || []).map((path) => {
            const isOnlyRight = data.find((d) => d.slug === bodyPart.slug)?.side === "right";
            return (
              <Path
                key={path}
                id={bodyPart.slug}
                d={path}
                fill={isOnlyRight ? "#3f3f3f" : getColorToFill(bodyPart)}
                stroke="#000"
                strokeWidth={0.5}
                {...(Platform.OS === "web"
                  ? { onPress: () => onBodyPartPress?.(bodyPart, "left") }
                  : { onPressIn: () => onBodyPartPress?.(bodyPart, "left") })}
              />
            );
          });

          const rightPaths = (bodyPart.path?.right || []).map((path) => {
            const isOnlyLeft = data.find((d) => d.slug === bodyPart.slug)?.side === "left";
            return (
              <Path
                key={path}
                id={bodyPart.slug}
                d={path}
                fill={isOnlyLeft ? "#3f3f3f" : getColorToFill(bodyPart)}
                stroke="#000"
                strokeWidth={0.5}
                {...(Platform.OS === "web"
                  ? { onPress: () => onBodyPartPress?.(bodyPart, "right") }
                  : { onPressIn: () => onBodyPartPress?.(bodyPart, "right") })}
              />
            );
          });

          return [...commonPaths, ...leftPaths, ...rightPaths];
        })}
      </SvgWrapper>
    );
  };

  if (gender === "female") {
    return renderBodySvg(side === "front" ? bodyFemaleFront : bodyFemaleBack);
  }

  return renderBodySvg(side === "front" ? bodyFront : bodyBack);
};

export default Body;
