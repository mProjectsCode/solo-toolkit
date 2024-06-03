import { random } from "../dice";
import { Map, Room, Cell, MAP_HEIGHT, MAP_WIDTH } from "./shared";

const SPLITS = 4;

export class TombGenerator implements Map {
  roomCount: number = random(4, 8);
  map: number[][] = [];
  leafs: Room[] = [];
  rooms: Room[] = [];

  constructor() {
    this.prepareMap();
    this.createLeafs();
    this.createRooms();
    // this.connectRooms();
  }

  at(x: number, y: number): number {
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) {
      return 0;
    } else {
      return this.map[x][y];
    }
  }

  private prepareMap() {
    this.map = [];
    for (let i = 0; i < MAP_WIDTH; i++) {
      this.map.push([]);
      for (let j = 0; j < MAP_HEIGHT; j++) {
        this.map[i].push(0);
      }
    }
  }

  private createLeafs() {
    this.leafs.push({ x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT });

    for (let i = 0; i < SPLITS; i++) {
      const newLeafs: Room[] = [];

      for (const index in this.leafs) {
        const leaf = this.leafs[index];
        const splitHorizontally = random(1, 2) === 1;
        if (splitHorizontally && leaf.h >= 10) {
          const splitAt = Math.floor(leaf.h / 2) + random(-1, 1);
          newLeafs.push({
            x: leaf.x,
            y: leaf.y,
            w: leaf.w,
            h: splitAt,
          });
          newLeafs.push({
            x: leaf.x,
            y: leaf.y + splitAt,
            w: leaf.w,
            h: leaf.h - splitAt,
          });
        } else if (leaf.w >= 10) {
          const splitAt = Math.floor(leaf.w / 2) + random(-1, 1);
          newLeafs.push({
            x: leaf.x,
            y: leaf.y,
            w: splitAt,
            h: leaf.h,
          });
          newLeafs.push({
            x: leaf.x + splitAt,
            y: leaf.y,
            w: leaf.w - splitAt,
            h: leaf.h,
          });
        } else {
          newLeafs.push({
            x: leaf.x,
            y: leaf.y,
            w: leaf.w,
            h: leaf.h,
          });
        }
      }

      this.leafs = newLeafs;

      // const indexes: number[] = Object.keys(newLeafs)
      //   .map((i) => Number(i))
      //   .sort()
      //   .reverse();
      // for (const index of indexes) {
      //   const newLeaf = newLeafs[index];
      //   if (newLeaf) {
      //     this.leafs.splice(Number(index), 1, ...newLeaf);
      //   }
      // }
    }
  }

  private createRooms() {
    for (const leaf of this.leafs) {
      for (let i = leaf.x; i < leaf.x + leaf.w - 1; i++) {
        for (let j = leaf.y; j < leaf.y + leaf.h - 1; j++) {
          this.map[i][j] = 1;
        }
      }
    }

    // let retryCount = 0;
    // const maxRetry = 100;

    // for (let i = 0; i < this.roomCount; i++) {
    //   const w = random(3, 5);
    //   const h = random(3, 5);
    //   const x = random(1, MAP_WIDTH - w - 2);
    //   const y = random(1, MAP_HEIGHT - h - 2);

    //   if (this.isRoomOverlapsOther({ x, y, w, h })) {
    //     if (retryCount > maxRetry) {
    //       return;
    //     } else {
    //       retryCount++;
    //       i--;
    //       continue;
    //     }
    //   } else {
    //     retryCount = 0;
    //   }

    //   this.rooms.push({ x, y, w, h });

    //   for (let cx = 0; cx < w; cx++) {
    //     for (let cy = 0; cy < h; cy++) {
    //       this.map[x + cx][y + cy] = 1;
    //     }
    //   }
    // }
  }

  private connectRooms() {
    let cellToConnectA = { x: 0, y: 0 };
    let cellToConnectB = { x: 0, y: 0 };
    let distance = MAP_WIDTH * MAP_HEIGHT;

    let connectionHash = "";
    const connectionHashes: string[] = []; // TODO: should be a tree or a linked list
    const getConnectionHash = (roomA: Room, roomB: Room) =>
      [this.rooms.indexOf(roomA), this.rooms.indexOf(roomB)].sort().join(".");

    for (const roomA of this.rooms) {
      distance = MAP_WIDTH * MAP_HEIGHT;

      for (const roomB of this.rooms) {
        if (roomA === roomB) continue;
        const hash = getConnectionHash(roomA, roomB);
        if (connectionHashes.includes(hash)) continue;

        const cellA = {
          x: random(roomA.x + 1, roomA.x + roomA.w - 2),
          y: random(roomA.y + 1, roomA.y + roomA.h - 2),
        };
        const cellB = {
          x: random(roomB.x + 1, roomB.x + roomB.w - 2),
          y: random(roomB.y + 1, roomB.y + roomB.h - 2),
        };
        const roomDistance = Math.sqrt(
          Math.pow(cellB.x - cellA.x, 2) + Math.pow(cellB.y - cellA.y, 2)
        );

        if (roomDistance < distance) {
          cellToConnectA = cellA;
          cellToConnectB = cellB;
          connectionHash = hash;
          distance = roomDistance;
        }
      }

      connectionHashes.push(connectionHash);
      this.connectCells(cellToConnectA, cellToConnectB);
    }
  }

  private connectCells(cellA: Cell, cellB: Cell) {
    let x = cellA.x;
    let y = cellA.y;
    let dx = cellB.x - x;
    let dy = cellB.y - y;
    let sx = 0;
    let sy = 0;

    let goHorizontal = Math.abs(dx) > Math.abs(dy) ? true : false;

    while (x !== cellB.x || y !== cellB.y) {
      dx = cellB.x - x;
      dy = cellB.y - y;
      sx = goHorizontal ? (dx > 0 ? 1 : -1) : 0;
      sy = goHorizontal ? 0 : dy > 0 ? 1 : -1;
      x += sx;
      y += sy;

      this.map[x][y] = 1;

      if (goHorizontal && x == cellB.x) {
        goHorizontal = false;
      } else if (!goHorizontal && y === cellB.y) {
        goHorizontal = true;
      }
    }
  }

  private isRoomOverlapsOther(roomA: Room): boolean {
    for (const roomB of this.rooms) {
      if (
        roomA.x - 1 < roomB.x + roomB.w &&
        roomA.x + roomA.w + 2 > roomB.x &&
        roomA.y - 1 < roomB.y + roomB.h &&
        roomA.y + roomA.h + 1 > roomB.y
      ) {
        return true;
      }
    }
    return false;
  }
}
