import _rawData from '@/../public/json/session.json'
import { formatDateString, fixedTimeZoneDate, generateAgendaTableData, generateAgendaListData, AgendaTableData, AgendaListData } from './utils'
import { groupBy } from 'lodash-es'

export * from './utils'

type RawData = typeof _rawData
type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];
type SessionData = ArrayElement<typeof _rawData.sessions>
type TypeData = ArrayElement<typeof _rawData['session_types']>
type SpeakerData = ArrayElement<typeof _rawData.speakers>
type RoomData = ArrayElement<typeof _rawData.rooms>
type TagData = ArrayElement<typeof _rawData.tags>
export type Room = RoomData

const rawData: RawData = Object.freeze(_rawData)

export interface Session extends Omit<SessionData, 'type' | 'room' | 'speakers' | 'tags' | 'start' | 'end'> {
  start: Date;
  end: Date;
  type: TypeData;
  roomId: string;
  room: RoomData;
  speakers: SpeakerData[];
  tags: TagData[];
}

export interface DayData {
  day: [number, number, number];
  table: AgendaTableData;
  list: AgendaListData;
}

export interface AgendaService {
  dayIndex: number;
  readonly day: [number, number, number];
  readonly table: AgendaTableData;
  readonly list: AgendaListData;
  getSessionById: (sessionId: string) => Readonly<Session> | null;
  getRoomById: (roomId: string) => Readonly<Room> | null;
}

class AgendaServiceConcrete implements AgendaService {
  // the minutes of time zone offset for zh-TW
  private readonly _timeZoneOffsetMinutes = -480
  private _roomSequence: string[] | undefined
  private _roomSet: { [roomId: string]: Room} = {}
  private _dayIndex = 0
  private _days: [number, number, number][] = []
  private _sessionDataListByDays: SessionData[][] = []
  private _dayDataCache: { [dateString: string]: DayData } = {}
  private _sessionsCache: { [sessionId: string]: Session } = {}

  constructor (roomSequence?: string[]) {
    this._roomSequence = roomSequence
    this._initRooms()
    this._initDays()
    this.dayIndex = 0
  }

  private _initDays (): void {
    Object.entries(
      groupBy(
        rawData.sessions,
        (sessionData) => formatDateString(
          fixedTimeZoneDate(
            new Date(sessionData.start),
            this._timeZoneOffsetMinutes
          ),
          ','
        )
      )
    )
      .map((entry) => {
        return [
          entry[0].split(',').map((numStr) => parseInt(numStr)),
          entry[1]
        ] as [[number, number, number], SessionData[]]
      })
      .forEach(([day, sessionDataList]) => {
        this._days.push(day)
        this._sessionDataListByDays.push(sessionDataList)
      })
  }

  private _initRooms (): void {
    rawData.rooms.forEach((room: Room) => {
      this._roomSet[room.id] = room
    })
  }

  private _generateDayData (dayIndex: number): DayData {
    const day = this._days[dayIndex]
    const sessionDataList = this._sessionDataListByDays[dayIndex]
    const fixedTimeZone = (date: Date | string) => fixedTimeZoneDate(date, this._timeZoneOffsetMinutes)

    sessionDataList.forEach((sessionData) => {
      if (this._sessionsCache[sessionData.id]) return
      this._sessionsCache[sessionData.id] = this._generateSession(sessionData)
    })

    return {
      day,
      table: generateAgendaTableData(sessionDataList, fixedTimeZone, this._roomSequence),
      list: generateAgendaListData(sessionDataList, fixedTimeZone, this._roomSequence)
    }
  }

  private _generateSession (sessionData: SessionData): Session {
    const type: TypeData | undefined = rawData.session_types.find((typeData: TypeData) => typeData.id === sessionData.type)
    if (type === undefined) throw new Error()

    const room: RoomData | undefined = rawData.rooms.find((roomData: RoomData) => roomData.id === sessionData.room)
    if (room === undefined) throw new Error()

    const speakers: SpeakerData[] = rawData.speakers.filter((speakerData: SpeakerData) => sessionData.speakers.includes(speakerData.id))
    if (speakers.length === 0) throw new Error()

    const tags: TagData[] = rawData.tags.filter((tagData: TagData) => sessionData.tags.includes(tagData.id))

    const start: Date = fixedTimeZoneDate(new Date(sessionData.start), this._timeZoneOffsetMinutes)
    if (start.toString() === 'Invalid Date') throw new Error()

    const end: Date = fixedTimeZoneDate(new Date(sessionData.end), this._timeZoneOffsetMinutes)
    if (end.toString() === 'Invalid Date') throw new Error()

    return {
      ...sessionData,
      start,
      end,
      type,
      roomId: sessionData.room,
      room,
      speakers,
      tags
    }
  }

  public get dayIndex (): number {
    return this._dayIndex
  }

  public set dayIndex (value: number) {
    if (value < 0 || value > this._days.length) throw new Error()
    if (!this._dayDataCache[value]) {
      this._dayDataCache[this._days[value].join('')] = this._generateDayData(value)
    }
    this._dayIndex = value
  }

  public get day (): [number, number, number] {
    return this._days[this.dayIndex]
  }

  public get table (): AgendaTableData {
    return this._dayDataCache[`${this._days[this.dayIndex].join('')}`].table
  }

  public get list (): AgendaListData {
    return this._dayDataCache[`${this._days[this.dayIndex].join('')}`].list
  }

  public getSessionById (sessionId: string): Readonly<Session> {
    const cache = this._sessionsCache[sessionId]
    if (cache) return cache
    const sessionData = rawData.sessions.find((sessionData) => sessionData.id === sessionId)
    if (!sessionData) throw new Error()
    this._sessionsCache[sessionId] = this._generateSession(sessionData)
    return this._sessionsCache[sessionId]
  }

  public getRoomById (roomId: string): Readonly<{ id: string; zh: { name: string }; en: { name: string } }> {
    const room = this._roomSet[roomId]
    if (!room) throw new Error()
    return room
  }
}

export function createAgendaService (roomSequence?: string[]): AgendaService {
  return new AgendaServiceConcrete(roomSequence)
}
